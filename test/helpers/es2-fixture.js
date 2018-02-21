const Promise = require('bluebird');
const request = require('request-promise');
const Elasticsearch = require('elasticsearch');
const config = require('../../config/index');
const RANDOMS = require('../fixtures/elasticsearch/random.json');

const BASE_URLs = config.elasticSearch.hosts;

const client = new Elasticsearch.Client({
  hosts: BASE_URLs,
  apiVersion: '2.4',
  log: 'warning'
});

// get ALL records in ES
exports.getAll = () => {
  return client.search({ index: '*' })
    .then(response => response.hits.hits);
};

exports.loadAll = () => {
  return new Promise((resolve, reject) => {
    Promise.resolve(RANDOMS)
      .mapSeries(hit => {
        const record = {
          id: hit._id,
          index: hit._index,
          type: hit._type,
          body: hit._source,
        };

        return client.create(record);
      })
      // wait 1.5 second to give it time to properly create all apis
      .then(() => setTimeout(resolve, 1500))
      .catch(reject);
  });
};

// delete ALL records in ES
exports.deleteAll = () => {
  return request.delete(BASE_URLs[0] + '/*');
};
