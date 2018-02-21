const _ = require('lodash');
const config = require('../../config');

/**
 * Returns all Kong cloud providers configured in configs (AWS, GCE, etc)
 */
exports.getClusters = () => {
  const clusters = config.kong.clusters;
  return _.keys(clusters);
};

exports.getUrl = (cluster) =>
  _.get(config, `kong.clusters.${cluster}.baseUrl`);

exports.getAuth = (cluster) => ({
  auth: {
    bearer: _.get(config, `kong.clusters.${cluster}.token`)
  },
  json: true
});

exports.getActivePlugins = () => {
  // get active plugins
  const activePluginsStr = _.get(config, 'kong.activePlugins', '');

  // trim all white spaces
  const trimmedActivePluginsStr = _.replace(activePluginsStr, /\s/g, '');

  // return plugins split by comma
  return trimmedActivePluginsStr.split(',');
};

// takes consumer.username and returns namespace, after `@`
exports.extractNamespaceFromConsumer = (consumer) => {
  const username = _.get(consumer, 'username', '');
  return this.extractNamespaceFromConsumerUsername(username);
};

// takes username and returns everything after `@`
exports.extractNamespaceFromConsumerUsername = (username) => {
  const atIndex = _.lastIndexOf(username, '@');

  // -1 means not found
  return atIndex > -1 ? username.substr(atIndex + 1) : '';
};

/**
 * Takes an ingress labels object, and join them with . or -
 * Joined in the same order as their keys' order
 *
 * e.g.
 * $serviceName.$serviceVersion.$serviceGroup.$namespace-$env.api.ypcgw
 *
 * @returns {String}
 */
exports.constructApiName = (ingressLabels, namespace) => {
  const serviceName = _.get(ingressLabels, 'codekube.io/service.name');
  const serviceVersion = _.get(ingressLabels, 'codekube.io/service.version');
  const serviceGroup = _.get(ingressLabels, 'codekube.io/service.group');

  // join them if their defined
  return [serviceName, serviceGroup, serviceVersion, namespace, 'api', 'ypcgw']
    .filter(s => !!s)
    .join('.');
};
