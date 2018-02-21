const request = require('request-promise');
const Promise = require('bluebird');
const util = require('util');
const _ = require('lodash');
const KubernetesClient = require('kubernetes-client');
const K8SUtils = require('../utils/kubernetes.utils');
const config = require('../../config');

const API_V1 = '/api/v1';
const API_BETA = '/apis/extensions/v1beta1';

const NODES = '/nodes';
const NAMESPACES = '/namespaces';
const PODS = '/pods';
const DEPLOYMENTS = '/deployments';
const EVENTS = '/events';
const LOGS = '/log';
const SERVICES = '/services';
const CONFIG_MAPS = '/configmaps';
const INGRESSES = '/ingresses';
const SCALE = '/scale';

/**
 * Returns all Kubernetes cloud providers configured in configs (AWS, GCE, etc)
 */
exports.getClusters = () => {
  const clusters = config.kubernetes.clusters;
  return _.keys(clusters);
};

/**
 * Namespaces List for specific cluster (AWS, GCE, etc)
 * GET /api/v1/namespaces
 */
exports.getNamespacesByCluster = (cluster) => {
  if (!cluster) {
    return Promise.resolve([]);
  }

  const URI = util.format('%s%s%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options)
    .then(response => response.items);
};

/**
 * Namespaces List = require(AWS and GCE
 * GET /api/v1/namespaces
 */
exports.getNamespaces = () => {
  const clusters = this.getClusters();

  return Promise.resolve(clusters)
    .map(cluster => this.getNamespacesByCluster(cluster))
    .then(response => _.uniqBy(_.flatten(response), 'metadata.name'));
};

/**
 * Nodes List for specific cluster (AWS, GCE, etc)
 * GET /api/v1/nodes
 */
exports.getNodesByCluster = (cluster) => {
  if (!cluster) {
    return Promise.resolve([]);
  }

  const URI = util.format('%s%s%s', K8SUtils.getUrl(cluster), API_V1, NODES);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  // there is a bit less capacity in AWS because `/nodes` also returns the masters, but these are not used for resource scheduling
  if (cluster === 'aws') {
    options.qs = {
      labelSelector: 'kubernetes.io/role=node'
    };
  }

  return request.get(options)
    .then(response => response.items);
};

/**
 * Nodes CPU/Memory Resources
 * GET /api/v1/nodes then extract resources
 */
exports.getNodesResources = () => {
  const clusters = this.getClusters();

  return Promise.resolve(clusters)
    .map(cluster => this.getNodesByCluster(cluster)
      .then(nodes => ({
          cluster: cluster,
          cpu: K8SUtils.getNodesTotalCPU(nodes),
          memory: K8SUtils.getNodesTotalMemory(nodes),
        }
      )));
};

/**
 * One Namespace
 * GET /api/v1/namespaces/{namespace}
 */
// exports.getNamespaceByName = function (server, namespace) {
//   const URI = util.format('%s%s%s/%s', K8SUtils.getUrl(server), API_V1, NAMESPACES, namespace);
//   const options = _.extend(K8SUtils.getAuth(server), { uri: URI });
//
//   return request.get(options);
// };

/**
 * Pods List
 * GET /api/v1/pods
 */
exports.getPods = (cluster) => {
  const URI = util.format('%s%s%s', K8SUtils.getUrl(cluster), API_V1, PODS);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Namespace Pods List
 * GET /api/v1/namespaces/{namespace}/pods
 */
exports.getNamespacePods = (cluster, namespace) => {
  const URI = util.format('%s%s%s/%s%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES, namespace, PODS);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Namespace Events List
 * GET /api/v1/namespaces/{namespace}/events
 */
exports.getNamespaceEvents = (cluster, namespace, type) => {
  const URI = util.format('%s%s%s/%s%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES, namespace, EVENTS);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  if (type) {
    options.qs = {
      fieldSelector: `type=${type}`
    };
  }

  return request.get(options)
    .then(response => response.items);
};

/**
 * Get Pod Logs
 * GET /api/v1/namespaces/{namespace}/pods/{pod}/log
 */
exports.getPodLogs = function (cluster, namespace, pod, container, previous) {
  const URI = util.format('%s%s%s/%s%s/%s%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES, namespace, PODS, pod, LOGS);

  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });
  options.qs = {
    previous,
    container,
    timestamps: true,
    tailLines: previous ? 100 : 1000
  };

  return request.get(options)
    .then(function (logs) {
      // Remove blank lines
      // 'g' is for replacing all of them
      logs = _.replace(logs, /\n\n/g, '\n');

      return _.split(logs, '\n')
        .filter(log => {
          const timestampRegex = /^((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\..+Z\s*)$/;
          const spacesOnlyRegex = /^\s*$/;

          // if a log is only a timestamp... remove it
          // logs look like `2017-09-26T22:31:08.220737045Z MESSAGE OF THE LOG`
          return !log.match(timestampRegex) && !log.match(spacesOnlyRegex);
        });
    });
};

/**
 * Delete Pod
 * DELETE /api/v1/namespaces/{namespace}/pods/{pod}
 */
exports.deletePod = function (cluster, namespace, pod) {
  const URI = util.format('%s%s%s/%s%s/%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES, namespace, PODS, pod);

  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });
  options.headers = {
    'Content-Type': 'application/json'
  };

  return request.delete(options)
    .then(pod => K8SUtils.stripPodSecrets(pod));
};

/**
 * Namespace Ingresses List
 * GET /apis/extensions/v1beta1/namespaces/{namespace}/ingresses
 */
function getNamespaceIngresses (cluster, namespace) {
  const URI = util.format('%s%s%s/%s%s', K8SUtils.getUrl(cluster), API_BETA, NAMESPACES, namespace, INGRESSES);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
}

exports.getServiceUrl = (namespace) => {
  return this.getAllNamespaceDeployments(namespace)
    .then(deploymentsByCluster => K8SUtils.extractDeploymentEnvironmentVariables(_.get(deploymentsByCluster[0], 'deployments[0]')))
    .then(envVars => {
      const isSoaJSService = K8SUtils.isSoaJSService(envVars);

      // if SoaJS, concatenate SOAJS_ENV, '-api.codekube.io', SOAJS_SERVICE_NAME
      if (isSoaJSService) {
        const SOAJS_ENV = K8SUtils.getEnvironmentVariableValue(envVars, 'SOAJS_ENV');
        const SOAJS_SERVICE_NAME = K8SUtils.getEnvironmentVariableValue(envVars, 'SOAJS_SERVICE_NAME');

        return 'https://' + SOAJS_ENV + '-api.codekube.io/' + SOAJS_SERVICE_NAME;
      } else {
        // if not SoaJS, concatenate ingress rule `host` and `path`
        return getNamespaceIngresses('aws', namespace)
          .then(ingresses => ingresses.items[0])
          .then(ingress => `https://${_.get(ingress, 'spec.rules[0].host')}${_.get(ingress, 'spec.rules[0].http.paths[0].path')}`);
      }
    });
};

exports.getNamespaceServices = (cluster, namespace) => {
  const URI = util.format('%s%s%s/%s%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES, namespace, SERVICES);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

exports.getServiceUpstreamUrl = (namespace) => {
  return this.getNamespaceServices('aws', namespace)
    .then(services => _.get(services, 'items[0].metadata.name'))
    .then(serviceName => `http://${serviceName}.${namespace}.svc.cluster.local`);
};

exports.getServiceHealth = (namespace) => {
  return this.getServiceUpstreamUrl(namespace)
    .then(upstreamUrl => request.get(`${upstreamUrl}/health`, { timeout: 5000 }))
    .then(() => true)
    .catch(() => false);
};

/**
 * Namespace ConfigMaps
 * GET /api/v1/namespaces/{namespace}/configmaps
 */
exports.getNamespaceConfigMaps = (cluster, namespace) => {
  const URI = util.format('%s%s%s/%s%s', K8SUtils.getUrl(cluster), API_V1, NAMESPACES, namespace, CONFIG_MAPS);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options)
    .then(response => _.get(response, 'items[0].data["config.json"]'))
    .then(config => {
      try {
        return JSON.parse(config);
      } catch (e) {
        // not able to parse as JSON
        return config;
      }
    });
};

/**
 * Namespace Ingresses List
 * GET /apis/extensions/v1beta1/namespaces/{namespace}/trafficUrl
 */
exports.getNamespaceKibanaDashboardURL = (namespace, isDarkTheme) => {
  return this.getAllNamespaceDeployments(namespace)
    .then(deploymentsByCluster => K8SUtils.extractDeploymentEnvironmentVariables(_.get(deploymentsByCluster[0], 'deployments[0]')))
    .then(envVars => {
      const isSoaJSService = K8SUtils.isSoaJSService(envVars);

      if (isSoaJSService) {
        const SOAJS_ENV = K8SUtils.getEnvironmentVariableValue(envVars, 'SOAJS_ENV');
        const SOAJS_SERVICE_NAME = K8SUtils.getEnvironmentVariableValue(envVars, 'SOAJS_SERVICE_NAME');
        const INGRESS_HOST = `${SOAJS_ENV}-api.codekube.io`;

        return encodeURIComponent(`ingress.host:"${INGRESS_HOST}" AND request:"/${SOAJS_SERVICE_NAME}/*"`);
      } else {
        return this.getAllNamespaceIngressesHosts(namespace)
          .then(ingressesHosts => {
            const queries = ingressesHosts.map(ingressHost => 'ingress.host:"' + ingressHost + '"');
            return encodeURIComponent(queries.join(' OR '));
          });
      }
    })
    .then(query => `https://search-codekube-es-logs-4pgqeht2kakr7rh7ar4cdhbjp4.us-east-1.es.amazonaws.com/_plugin/kibana/app/kibana#/dashboard/IngressStatsPerHost?embed=true&_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-7d,mode:quick,to:now))&_a=(filters:!(),options:(darkTheme:!${(isDarkTheme === 'true') ? 't' : 'f'}),panels:!((col:1,id:TotalByResponseCode-overTime,panelIndex:1,row:1,size_x:12,size_y:3,type:visualization),(col:1,id:Total-Visitors,panelIndex:3,row:4,size_x:3,size_y:2,type:visualization),(col:7,id:Bytes-vs.-Time,panelIndex:4,row:4,size_x:6,size_y:2,type:visualization),(col:4,id:CountPerCloudProvider,panelIndex:7,row:4,size_x:3,size_y:2,type:visualization),(col:7,id:Top10-Slowest-Response-Time,panelIndex:6,row:6,size_x:6,size_y:6,type:visualization),(col:1,id:Top10Request-Count,panelIndex:5,row:6,size_x:6,size_y:5,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:'${query}')),title:IngressStatsPerHost,uiState:(P-1:(vis:(legendOpen:!t)),P-4:(spy:(mode:(fill:!f,name:!n)),vis:(legendOpen:!f)),P-5:(vis:(params:(sort:(columnIndex:!n,direction:!n)))),P-6:(vis:(params:(sort:(columnIndex:!n,direction:!n)))),P-7:(spy:(mode:(fill:!f,name:!n)),vis:(params:(sort:(columnIndex:!n,direction:!n))))))`);
};

/**
 * Namespace Ingresses Hosts, as Array<string>
 */
exports.getAllNamespaceIngressesServiceLabels = (namespace) => {
  const clusters = this.getClusters();

  return Promise.resolve(clusters)
    .map(cluster => getNamespaceIngresses(cluster, namespace)
      .then(ingresses => K8SUtils.extractLabelsServiceAttributes(ingresses.items)))
    .then(clustersLabels => _.reduce(clustersLabels, _.extend));
};

/**
 * Namespace Ingresses Hosts, as Array<string>
 */
exports.getAllNamespaceIngressesHosts = (namespace) => {
  const clusters = this.getClusters();

  return Promise.resolve(clusters)
    .map(cluster => getNamespaceIngresses(cluster, namespace)
      .then(ingresses => K8SUtils.extractIngressesHosts(ingresses.items)))
    .then(hosts => _.uniq(_.flattenDeep(hosts)));
};

/**
 * Namespace Deployments List
 * GET /apis/extensions/v1beta1/namespaces/{namespace}/deployments
 */
exports.getNamespaceDeployments = (cluster, namespace) => {
  const URI = util.format('%s%s%s/%s%s', K8SUtils.getUrl(cluster), API_BETA, NAMESPACES, namespace, DEPLOYMENTS);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * All Namespace Deployments List
 */
exports.getAllNamespaceDeployments = (namespace) => {
  const clusters = this.getClusters();

  return Promise.resolve(clusters)
    .map(cluster => this.getNamespaceDeployments(cluster, namespace)
      .then(deployments => ({
        cluster: cluster,
        deployments: deployments.items,
      })));
};

/**
 * Deployment Pods List
 */
exports.getDeploymentPods = (cluster, namespace, deployment) => {
  return Promise.resolve(this.getNamespacePods(cluster, namespace))
    .then(pods => _.filter(pods.items, (pod) => _.includes(pod.metadata.name, `${deployment}-`)))
    .map(pod => K8SUtils.stripPodSecrets(pod));
};

/**
 * Patch deployment's scale
 * PATCH /apis/extensions/v1beta1/namespaces/{namespace}/deployments/{deployment}/scale
 */
exports.patchDeploymentScale = (cluster, namespace, deployment, body) => {
  const URI = util.format('%s%s%s/%s%s/%s%s', K8SUtils.getUrl(cluster), API_BETA, NAMESPACES, namespace, DEPLOYMENTS, deployment, SCALE);
  const options = _.extend(K8SUtils.getAuth(cluster), { uri: URI });

  options.body = body;
  options.headers = {
    'Content-Type': 'application/strategic-merge-patch+json'
  };

  return request.patch(options);
};

exports.streamPodLogs = (cluster, namespace, pod, container) => {
  const kubernetesClient = new KubernetesClient.Core({
    url: K8SUtils.getUrl(cluster),
    version: 'v1',
    namespace: namespace,
    insecureSkipTlsVerify: true,
    auth: {
      bearer: _.get(config, `kubernetes.clusters[${cluster}].token`)
    }
  });

  const queries = {
    follow: true,
    pretty: true,
    timestamps: true,
    tailLines: 100,
    container,
  };

  return kubernetesClient.namespaces.pods(pod).log.get({
    qs: queries,
  });
};

exports.watchNamespacePods = (cluster, namespace) => {
  const kubernetesClient = new KubernetesClient.Core({
    url: K8SUtils.getUrl(cluster),
    version: 'v1',
    namespace: namespace,
    insecureSkipTlsVerify: true,
    auth: {
      bearer: _.get(config, `kubernetes.clusters[${cluster}].token`)
    }
  });

  const queries = {
    watch: true,
  };

  return kubernetesClient.namespaces.pods.get({
    qs: queries,
  });
};

exports.watchAllEvents = (cluster) => {
  const kubernetesClient = new KubernetesClient.Core({
    url: K8SUtils.getUrl(cluster),
    version: 'v1',
    insecureSkipTlsVerify: true,
    auth: {
      bearer: _.get(config, `kubernetes.clusters[${cluster}].token`)
    }
  });

  const queries = {
    watch: true,
  };

  return kubernetesClient.events.get({
    qs: queries,
  });
};

/**
 * Get maximum number of deployments' revisions
 * 1) Get all namespaces
 * 2) Get deployments for each namespace
 * 3) Get maximum number of 'revisions' between those deployments
 * 4) Add to 'count'
 */
exports.countDeploymentsByCluster = (cluster) => {
  let count = 0;

  return Promise.resolve()
    .then(() => this.getNamespacesByCluster(cluster))
    .mapSeries(namespace => {
      return this.getNamespaceDeployments(cluster, namespace.metadata.name)
        .then(K8SUtils.getMaxRevisions)
        .then(max => {
          count += +max;
          return max;
        });
    })
    .then(() => count);
};

/**
 * Get total number of pods
 */
exports.countPodsByCluster = (cluster) => {
  return this.getPods(cluster)
    .then(function (pods) {
      return pods.items.length;
    })
    .catch(function (error) {
      return new Error(error);
    });
};
