const request = require('request-promise');
const util = require('util');
const config = require('../../config');

const BASE_URL = config.provisions.baseUrl;
const KEY = config.provisions.key;

const DNS = '/dns';
const PROVISIONS = '/provisions';

/**
 * Check DNS Availability
 * GET /DNS
 */
exports.checkDNS = ({ dns, type }) => {
  const URI = util.format('%s%s', BASE_URL, DNS);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
      dns,
      type,
    },
    json: true
  };

  return request.get(options);
};

/**
 * Initialize New Project
 * POST /provisions/:owner/:repo
 */
exports.initNewProject = (owner, repo, configs, requester) => {
  const URI = util.format('%s%s/%s/%s', BASE_URL, PROVISIONS, owner, repo);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
    },
    body: {
      configs,
      requester,
    },
    json: true
  };

  return request.post(options);
};

/**
 * Create Service Provisioning
 * POST /provisions/:owner/:repo/:service
 */
exports.provisionService = (owner, repo, service, config, requester) => {
  const URI = util.format('%s%s/%s/%s/%s', BASE_URL, PROVISIONS, owner, repo, service);

  const options = {
    uri: URI,
    qs: {
      key: KEY,
    },
    body: {
      config,
      requester,
    },
    json: true
  };

  return request.post(options);
};
