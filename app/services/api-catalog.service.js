const Promise = require('bluebird');
const request = require('request-promise');
const Elasticsearch = require('elasticsearch');
const esRequestBuilder = require('bodybuilder');
const moment = require('moment');
const _ = require('lodash');
const KubernetesService = require('./kubernetes.service');
const SwaggerService = require('./swagger.service');
const K8SUtils = require('../utils/kubernetes.utils');
const config = require('../../config/index');

const BASE_URLs = config.elasticSearch.hosts;
const TYPE = 'api-catalog';
const CATALOG_BASE_INDEX = 'api-catalog-';
const REQUEST_SIZE = config.elasticSearch.requestSize;

const client = new Elasticsearch.Client({
  hosts: BASE_URLs,
  apiVersion: '2.4',
  log: 'warning'
});

exports.getServiceGroups = (env) => {
  env = env || '*';

  const options = {
    uri: `${BASE_URLs[0]}/${CATALOG_BASE_INDEX}${env}/${TYPE}/_search`,
    json: true,
    body: {
      size: 0,
      aggregations: {
        uniqueServiceGroups: {
          terms: {
            field: 'serviceGroup',
            order: { '_term': 'asc' },
            size: 0
          }
        }
      }
    }
  };

  return request.get(options)
    .then(response => ({
      total: _.get(response, 'hits.total', 0),
      serviceGroups: _.get(response, 'aggregations.uniqueServiceGroups.buckets', [])
    }));
};

// env = dev|qa|prod|*
exports.searchAPICatalog = (env, serviceGroup, searchTerms) => {
  env = env || '*';

  const searchRequest = {
    index: `${CATALOG_BASE_INDEX}${env}`,
    type: TYPE,
    size: REQUEST_SIZE,
    _sourceExclude: ['spec', '@timestamp']
  };

  let bodyBuilder = esRequestBuilder();

  if (serviceGroup) {
    bodyBuilder = bodyBuilder.query('match', 'serviceGroup', serviceGroup);
  }

  if (searchTerms) {
    const searchTermsRequest = searchTerms.replace(/\s*,\s*/g, ',').split(',').map(searchTerm => `*${searchTerm}*`).join(' AND ');
    bodyBuilder = bodyBuilder.query('query_string', {
      query: searchTermsRequest,
      fields: ['namespace', 'serviceGroup', 'serviceName', 'spec', 'repo.owner', 'repo.name']
    });
  }

  // sort Swaggers by serviceGroup, then serviceName, then namespace
  bodyBuilder = bodyBuilder.sort([
    {
      serviceGroup: {
        order: 'asc',
        ignore_unmapped: true
      }
    },
    {
      serviceName: {
        order: 'asc',
        ignore_unmapped: true
      }
    },
    {
      namespace: {
        order: 'asc',
        ignore_unmapped: true
      }
    }
  ]);

  searchRequest.body = bodyBuilder.build();

  return Promise.resolve(client.search(searchRequest))
    .then(response => response.hits.hits)
    .map(hit => hit._source);
};

exports.writeApiEntries = () => {
  return Promise.resolve(KubernetesService.getNamespaces())
    .mapSeries(namespace => this.writeApiEntry(namespace));
};

exports.writeApiEntry = (namespace) => {
  if (!namespace) {
    return;
  }

  const namespaceName = K8SUtils.extractNamespaceName(namespace);
  const repoOwner = K8SUtils.extractNamespaceRepoOwner(namespace);
  const repoName = K8SUtils.extractNamespaceRepoName(namespace);
  const repoBranch = K8SUtils.extractNamespaceRepoBranch(namespace);
  const env = K8SUtils.extractNamespaceEnvironment(namespaceName, repoBranch);

  console.log('===== Started processing Swagger for', namespaceName, ' =====');

  const entry = {
    // namespaceName is always unique, thus a good candidate for _id and avoid dupes
    id: `${TYPE}-${namespaceName}`,
    index: `${CATALOG_BASE_INDEX}${env}`,
    type: TYPE,
    timeout: '2s',
    body: {
      doc: {
        '@timestamp': moment.utc(),
        namespace: namespaceName,
        repo: {
          owner: repoOwner,
          name: repoName
        }
      },
      doc_as_upsert: true
    }
  };

  return KubernetesService.getAllNamespaceIngressesServiceLabels(namespaceName)
    .then(labels => {
      // if we actually have labels
      if (labels) {
        const serviceGroup = labels['codekube.io/service.group'];
        const serviceName = labels['codekube.io/service.name'];

        if (serviceGroup) {
          entry.body.doc.serviceGroup = serviceGroup;
        }

        if (serviceName) {
          entry.body.doc.serviceName = serviceName;
        }

        console.log(`Got Ingress labels for ${namespaceName}, (${serviceGroup}, ${serviceName})`);
      }
    })
    .catch(() => console.log('Unable to get Ingress labels for', namespaceName))
    .then(() => SwaggerService.getSwaggerFile(namespaceName))
    .then(swaggerJSON => {
      // on frontend, we don't return the spec (too big), but only basic info
      entry.body.doc.info = {
        title: _.get(swaggerJSON, 'info.title'),
        description: _.get(swaggerJSON, 'info.description')
      };

      // JSON.stringify, so we don't confuse ES with all the different Swagger mappings
      entry.body.doc.spec = JSON.stringify(swaggerJSON);
    })
    .then(() => {
      if (env && entry.body.doc.spec) {
        console.log('Got Swagger spec for', namespaceName);

        return client.update(entry)
          .catch((error) => console.log('Error updating Swagger ES entry for', namespaceName, entry, error));
      } else {
        console.log(namespaceName, 'had no env or Swagger spec, skipping...');
      }
    })
    // if we DON'T have a Swagger file, make sure we delete it from ES if it was there
    .catch(() => {
      console.log('Error getting Swagger file for', namespaceName, ', deleting existing ES entry, if any.');

      return client.delete({ id: entry.id, type: entry.type, index: entry.index, timeout: '2s' })
      // if it's not found in ES, it throws an error,
      // so we catch it in order to continue the loop
        .then(() => console.log(`Deleted ${entry.id} from API Catalog in ES`))
        .catch(() => console.log(`Could not delete ${entry.id} from API Catalog in ES, erred or simply never existed`));
    })
    .then(() => console.log('===== Finished processing Swagger for', namespaceName, ' ====='));
};
