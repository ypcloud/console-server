const request = require('request-promise');
const util = require('util');
const config = require('../../config/index');

// Check Consul KV docs for more details
// https://www.consul.io/docs/commands/kv.html

const CONSUL_BASE_URL = config.consul.baseUrl;
const CONSUL_PORT = config.consul.port;
const CONSUL_TOKEN = config.consul.token;
const CONSUL_DC = config.consul.dataCenter;

const ROOT_KEY = 'svc';
const V1 = 'v1';
const KV = 'kv';

exports.keys = (key) => {
  key = key || '';

  const URI = util.format('%s/%s', getUrl(), key);
  const OPTIONS = {
    uri: URI,
    qs: {
      token: CONSUL_TOKEN,
      dc: CONSUL_DC,
      recurse: true,
      keys: true,
      separator: '/',
    },
    json: true
  };

  return request.get(OPTIONS);
};

exports.get = (key) => {
  key = key || '';

  const URI = util.format('%s/%s', getUrl(), key);
  const OPTIONS = {
    uri: URI,
    qs: {
      token: CONSUL_TOKEN,
      dc: CONSUL_DC,
      raw: true,
    },
  };

  return request.get(OPTIONS);
};

exports.set = (key, value) => {
  key = key || '';

  const URI = util.format('%s/%s', getUrl(), key);
  const OPTIONS = {
    uri: URI,
    qs: {
      token: CONSUL_TOKEN,
      dc: CONSUL_DC,
    },
    body: value
  };

  return request.put(OPTIONS);
};

exports.del = (key) => {
  key = key || '';

  const URI = util.format('%s/%s', getUrl(), key);
  const OPTIONS = {
    uri: URI,
    qs: {
      token: CONSUL_TOKEN,
      dc: CONSUL_DC,
      recurse: true,
    }
  };

  return request.del(OPTIONS);
};

const getUrl = () => {
  return `${CONSUL_BASE_URL}:${CONSUL_PORT}/${V1}/${KV}/${ROOT_KEY}`;
};
