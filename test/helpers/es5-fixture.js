const Promise = require('bluebird');
const request = require('request-promise');
const Elasticsearch = require('elasticsearch');
const config = require('../../config/index');
const LOGS = require('../fixtures/elasticsearch/logs.json');

const BASE_URL = config.elasticsearch.baseUrl;

const client = new Elasticsearch.Client({
  hosts: BASE_URL,
  apiVersion: '5.1',
  log: 'warning'
});

// get ALL records in ES
exports.getAll = () => {
  return client.search({ index: '*' })
    .then(response => response.hits.hits);
};

exports.loadAll = () => {
  return new Promise((resolve, reject) => {
    Promise.resolve(LOGS)
      .mapSeries(hit => {
        const record = {
          id: hit._id,
          index: hit._index,
          type: hit._type,
          body: hit._source,
        };

        return client.create(record);
      })
      // wait 2 seconds to give it time to properly create all apis
      .then(() => setTimeout(resolve, 2000))
      .catch(reject);
  });
};

// delete ALL records in ES
exports.deleteAll = () => {
  return request.delete(BASE_URL + '/*');
};
