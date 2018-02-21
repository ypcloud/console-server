const bluebird = require('bluebird');
const request = require('request-promise');
const PubSub = require('@google-cloud/pubsub');
const config = require('../../config');

const pubsub = PubSub({
  projectId: config.pubsub.projectId,
  credentials: config.pubsub.credentials,
  promise: bluebird
});

const BASE_URL = config.pubsub.baseUrl;
const KEY = config.pubsub.key;

const topic = pubsub.topic(config.pubsub.topic);
const subscription = config.pubsub.subscription;

/**
 * Get events from BigQuery
 * GET /
 */
exports.getEvents = ({ namespace, user, since, to }) => {
  const options = {
    uri: BASE_URL,
    qs: {
      key: KEY,
      namespace,
      user,
      since,
      to
    },
    json: true
  };

  return request.get(options);
};

/**
 * Publish an event to PubSub
 * POST /
 */
exports.publish = (event) => {
  const options = {
    uri: BASE_URL,
    qs: {
      key: KEY
    },
    body: event,
    json: true
  };

  return request.post(options);
};

exports.watchEvents = () => {
  return topic.subscription(subscription);
};
