const request = require('request-promise');
const Promise = require('bluebird');
const util = require('util');
const KubernetesService = require('./kubernetes.service');
const config = require('../../config');

const BASE_URL = config.uptime.baseUrl;
const KEY = config.uptime.key;

const SLA = '/sla';
const UPTIMES = '/uptimes';
const DOWNTIMES = '/downtimes';
const INFRAS = '/infras';

/**
 * Get sla
 * GET /sla
 */
exports.getSLA = ({ uptimeId, category, kind, namespace, since, to }) => {
  const URI = util.format('%s%s', BASE_URL, SLA);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
      uptimeId,
      category,
      kind,
      namespace,
      since,
      to
    },
    json: true
  };

  return KubernetesService.getServiceUrl(namespace)
    .then(url => `${url}/health`)
    .then(healthUrl => options.qs.url = healthUrl)
    .then(() => request.get(options));
};

/**
 * Get uptimes
 * GET /uptimes
 */
exports.getUptimes = ({ uptimeId, category, kind, namespace, interval, since, to }) => {
  const URI = util.format('%s%s', BASE_URL, UPTIMES);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
      uptimeId,
      category,
      kind,
      namespace,
      interval,
      since,
      to,
    },
    json: true
  };

  return KubernetesService.getServiceUrl(namespace)
    .then(url => `${url}/health`)
    .then(healthUrl => options.qs.url = healthUrl)
    .then(() => request.get(options));
};

/**
 * Get downtimes
 * GET /downtimes
 */
exports.getDowntimes = ({ uptimeId, category, kind, namespace, since, to }) => {
  const URI = util.format('%s%s', BASE_URL, DOWNTIMES);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
      uptimeId,
      category,
      kind,
      namespace,
      since,
      to,
    },
    json: true
  };

  return KubernetesService.getServiceUrl(namespace)
    .then(url => `${url}/health`)
    .then(healthUrl => options.qs.url = healthUrl)
    .then(() => request.get(options));
};

/**
 * Get infras
 * GET /infras
 */
exports.getInfras = ({ kind }) => {
  const URI = util.format('%s%s', BASE_URL, INFRAS);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
      kind
    },
    json: true
  };

  return request.get(options);
};

/**
 * Get infras uptimes
 * GET /infras/uptimes
 */
exports.getInfrasUptimes = ({ kind, interval, since, to }) => {
  return Promise.resolve(this.getInfras({ kind }))
    .map(infra => this.getUptimes({ uptimeId: infra._id, interval, since, to })
      .then(uptimes => ({ infra, uptimes })));
};
