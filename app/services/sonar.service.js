const request = require('request-promise');
const util = require('util');
const _ = require('lodash');
const config = require('../../config/index');

const BASE_URL = config.sonar.baseUrl;
const API_BASE_URL = BASE_URL + '/api';

const CREDENTIALS = config.sonar.credentials;
const AUTH = { auth: CREDENTIALS };

const RESOURCES = '/measures/component';
const PROJECTS = '/components/search';

/**
 * Sonar Metrics for a specific repo
 * GET /api/measures/components?componentKey=CLOUD:dashboard&metricKeys=violations,coverage
 */
exports.getMetrics = function (owner, name, branch, metrics) {
  metrics = processMetrics(metrics);

  // defaults to master branch
  branch = branch || 'master';

  const URI = util.format('%s%s', API_BASE_URL, RESOURCES);
  const KEY = [owner, name].join(':'); // can use the Sonar resource key (instead of id) as git's `PROJECT_KEY:REPO_NAME:BRANCH`
  const QS = {
    componentKey: KEY,
    metricKeys: metrics
  };
  const options = _.extend(AUTH, { uri: URI }, { qs: QS }, { json: true });

  return request.get(options)
    .then(function (metrics) {
      return {
        metrics: metrics,
        url: BASE_URL + '/dashboard?id=' + KEY
      };
    });
};

exports.getProjects = function () {
  const URI = util.format('%s%s', API_BASE_URL, PROJECTS);
  const QS = {
    qualifiers: 'TRK',
    ps: 2000
  };
  const options = _.extend(AUTH, { uri: URI }, { qs: QS }, { json: true });

  return request.get(options);
};

function processMetrics (metrics) {
  if (!metrics) {
    return '';
  }

  return metrics.replace(/\s+/g, '');
}
