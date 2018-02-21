const httpStatus = require('http-status');
const ElasticsearchService = require('../services/elasticsearch.service');
const APICatalogService = require('../services/api-catalog.service');

/**
 * Namespace index search
 * see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.searchByNamespace = (req, res, next) => {
  const namespace = req.params.namespace;
  const searchText = req.query.searchText;
  const timestamp = req.query.timestamp;
  const rangeType = req.query.rangeType;
  const order = req.query.order;
  const lowerBoundTimestamp = req.query.lowerBoundTimestamp;
  const upperBoundTimestamp = req.query.upperBoundTimestamp;

  ElasticsearchService.searchByNamespace(namespace, searchText, timestamp, rangeType, order, lowerBoundTimestamp, upperBoundTimestamp)
    .then(logs => {
      res.status(httpStatus.OK).json({
        result: true,
        data: logs
      });
    })
    .catch(() => next(new Error('Error getting ES logs')));
};

exports.getServiceGroups = (req, res, next) => {
  const environment = req.params.environment;

  APICatalogService.getServiceGroups(environment)
    .then(groups => {
      res.status(httpStatus.OK).json({
        result: true,
        data: groups
      });
    })
    .catch(() => next(new Error('Error getting services groups')));
};

exports.searchAPICatalog = (req, res, next) => {
  const environment = req.params.environment;
  const serviceGroup = req.query.serviceGroup;
  const searchTerms = req.query.searchTerms;

  APICatalogService.searchAPICatalog(environment, serviceGroup, searchTerms)
    .then(apis => {
      res.status(httpStatus.OK).json({
        result: true,
        data: apis
      });
    })
    .catch(() => next(new Error('Error searching API Catalog')));
};
