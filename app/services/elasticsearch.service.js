const Elasticsearch = require('elasticsearch');
const AWS = require('aws-sdk');
const AWSElasticsearchConnection = require('http-aws-es');
const esQueryBuilder = require('bodybuilder');
const moment = require('moment');
const _ = require('lodash');
const config = require('../../config/index');

const BASE_URL = config.elasticsearch.baseUrl;
const AMAZON_ES = config.elasticsearch.amazonES;
const CONNECTION_CLASS = config.elasticsearch.connectionClass;
const REQUEST_SIZE = config.elasticsearch.requestSize;

const client = new Elasticsearch.Client({
  host: BASE_URL,
  connectionClass: CONNECTION_CLASS || AWSElasticsearchConnection,
  awsConfig: new AWS.Config(AMAZON_ES),
  apiVersion: '5.1',
  log: 'warning'
});

/**
 * Namespace index search
 * see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
 *
 * namespace: required
 * searchText: to search in `message` and `message_json`
 * timestamp: get logs before or after this timestamp, depending on rangeType
 * rangeType: lte|gte, fetch logs older or newer than specified timestamp
 * lowerBoundTimestamp: oldest log to fetch
 * upperBoundTimestamp: newest log to fetch
 *
 */
exports.searchByNamespace = (namespace, searchText, timestamp, rangeType, order, lowerBoundTimestamp, upperBoundTimestamp) => {
  console.log(namespace, searchText, timestamp, rangeType, order, lowerBoundTimestamp, upperBoundTimestamp);

  // namespace is required, and can't contain a wildcard
  if (!namespace || namespace.includes('*')) {
    return Promise.reject(new Error('namespace is required'));
  }

  const index = `cld-${namespace}-*`;

  const searchRequest = {
    index: index,
    size: REQUEST_SIZE,
    _sourceInclude: ['message', 'message_json', '@timestamp']
  };

  // Search Request body
  let bodyBuilder = esQueryBuilder()
    .sort('@timestamp', order)
    .query('match', 'kubernetes.namespace_name.keyword', namespace);

  bodyBuilder = bodyBuilder.sort('@timestamp', order);

  if (searchText && searchText !== '*') {
    // \S+\s*,*\s*\S+: match any non-whitespace characters around spaces/commas
    const searchTermsRequest = searchText.replace(/\W+/g, ',').split(',').map(searchTerm => `*${searchTerm}*`).join(' AND ');

    bodyBuilder = bodyBuilder.query('query_string', {
      query: searchTermsRequest,
      fields: ['message', 'message_json.*']
    });
  }

  if (timestamp && !rangeType) {
    return Promise.reject(new Error('rangeType (lte|gte) is required when timestamp is provided'));
  }

  const whitelistedRangeTypes = ['lte', 'gte'];
  if (rangeType && !whitelistedRangeTypes.includes(rangeType)) {
    return Promise.reject(new Error('Invalid rangeType, only lte|gte are allowed'));
  }

  // If no time range is present, get events since start of day
  if (!timestamp) {
    const boundTimestamp = lowerBoundTimestamp || upperBoundTimestamp;
    const momentTimestamp = boundTimestamp ? moment(boundTimestamp, 'x') : moment();

    timestamp = momentTimestamp
      .startOf('day')
      .valueOf();
    rangeType = 'gte';
  }

  // When timestamp is present set ranges
  const range = {
    '@timestamp': {
      format: 'epoch_millis'
    }
  };
  range['@timestamp'][rangeType] = timestamp;
  bodyBuilder = bodyBuilder.query('range', range);

  // if lowerBoundTimestamp, everything must be greater than it
  if (lowerBoundTimestamp) {
    const range = {
      '@timestamp': {
        format: 'epoch_millis',
        gte: lowerBoundTimestamp
      }
    };
    bodyBuilder = bodyBuilder.query('range', range);
  }

  // if upperBoundTimestamp, everything must be lower than it
  if (upperBoundTimestamp) {
    const range = {
      '@timestamp': {
        format: 'epoch_millis',
        lte: upperBoundTimestamp
      }
    };
    bodyBuilder = bodyBuilder.query('range', range);
  }

  searchRequest.body = bodyBuilder.build();

  return client.search(searchRequest)
    .then(response => _.get(response, 'hits.hits', []));
};
