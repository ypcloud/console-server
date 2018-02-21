const Promise = require('bluebird');
const _ = require('lodash');
const config = require('../../config/index');

/**
 * Return costs from consul
 */
exports.getCosts = (component) => {
  let response = {};

  if (component) {
    response[component] = _.get(config, `costs[${component}]`);
  } else {
    response = config.costs;
  }

  return Promise.resolve(response);
};
