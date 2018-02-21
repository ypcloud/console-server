const Promise = require('bluebird');
const request = require('request-promise');
const util = require('util');
const _ = require('lodash');
const KubernetesService = require('./kubernetes.service');
const KongUtils = require('../utils/kong.utils');

const CONSUMERS = '/consumers';
const PLUGINS = '/plugins';
const ENABLED = '/enabled';
const SCHEMA = '/schema';
const APIS = '/apis';

// CONSUMERS

/**
 * Get consumers
 * GET /consumers
 */
exports.getConsumers = (cluster) => {
  const URI = util.format('%s%s', KongUtils.getUrl(cluster), CONSUMERS);
  const options = _.extend({ uri: URI, json: true });

  options.qs = {
    size: 1000
  };

  return request.get(options);
};

/**
 * Get one consumer
 * GET /consumers/:username or :id
 */
exports.getConsumerByUsername = (cluster, username) => {
  const URI = util.format('%s%s/%s', KongUtils.getUrl(cluster), CONSUMERS, username);
  const options = _.extend({ uri: URI, json: true });

  return request.get(options);
};

/**
 * Get consumers, filtered by username: ...@namespace
 * GET /consumers
 */
exports.getConsumersByNamespace = (cluster, namespace) => {
  return this.getConsumers(cluster)
    .then(consumersList => {
      const filteredList = _.cloneDeep(consumersList);

      // keep only consumers that username end with `@{namespace}` and custom_id with `.consumer.ypcgw`
      filteredList.data = filteredList.data
        .filter(consumer => KongUtils.extractNamespaceFromConsumer(consumer) === namespace)
        .filter(consumer => consumer.custom_id && consumer.custom_id.endsWith('.consumer.ypcgw'));

      return filteredList;
    });
};

/**
 * Create one consumer
 * POST /consumers
 */
exports.createConsumer = (cluster, username) => {
  const URI = util.format('%s%s', KongUtils.getUrl(cluster), CONSUMERS);
  const options = {
    uri: URI,
    body: { username },
    json: true
  };

  return request.post(options);
};

/**
 * Get consumer plugin's config
 * GET /consumers/:username/:pluginName
 */
exports.getConsumerPluginConfig = (cluster, username, pluginName) => {

  if (!username) {
    return Promise.reject('Username is required');
  }

  if (!pluginName) {
    return Promise.reject('Plugin name is required');
  }

  const URI = util.format('%s%s/%s/%s', KongUtils.getUrl(cluster), CONSUMERS, username, pluginName);
  const options = _.extend({ uri: URI, json: true });

  return request.get(options);
};

/**
 * Create consumer plugin's config
 * POST /consumers/:username/:pluginName
 */
exports.createConsumerPluginConfig = (cluster, username, pluginName, namespace, config) => {

  if (!username) {
    return Promise.reject('Username is required');
  }

  if (!pluginName) {
    return Promise.reject('Plugin name is required');
  }

  if (!namespace) {
    return Promise.reject('Namespace is required');
  }

  const URI = util.format('%s%s/%s/%s', KongUtils.getUrl(cluster), CONSUMERS, username, pluginName);
  const options = {
    uri: URI,
    body: config,
    json: true
  };

  // for `acls`, append `@$serviceGroup.$env` to group
  if (pluginName === 'acls') {
    return KubernetesService.getAllNamespaceIngressesServiceLabels(namespace)
      .then(labels => {
        const serviceGroupEnv = `@${labels['codekube.io/service.group']}.${labels['codekube.io/service.env']}`;
        let group = _.get(options, 'body.group');

        if (group && group.trim() && !group.endsWith(serviceGroupEnv)) {
          group = `${group}${serviceGroupEnv}`.replace(/\s/g, '');
          _.set(options, 'body.group', group);
        }

        return request.post(options);
      });
  } else {
    return request.post(options);
  }
};

/**
 * Delete consumer plugin's config
 * DELETE /consumers/:username/:pluginName
 */
exports.deleteConsumerPluginConfig = (cluster, username, pluginName, configId) => {

  if (!username) {
    return Promise.reject('Username is required');
  }

  if (!pluginName) {
    return Promise.reject('Plugin name is required');
  }

  if (!configId) {
    return Promise.reject('Config id is required');
  }

  const URI = util.format('%s%s/%s/%s/%s', KongUtils.getUrl(cluster), CONSUMERS, username, pluginName, configId);
  const options = _.extend({ uri: URI, json: true });

  return request.delete(options);
};

/**
 * Delete one consumer
 * DELETE /consumers/:namespace
 */
exports.deleteConsumer = (cluster, namespace) => {
  const URI = util.format('%s%s/%s', KongUtils.getUrl(cluster), CONSUMERS, namespace);
  const options = _.extend({ uri: URI, json: true });

  return request.delete(options);
};

// PLUGINS

/**
 * Get plugins
 * GET /plugins
 */
exports.getPlugins = (cluster, enabledOnly = false) => {
  const URI = util.format('%s%s', KongUtils.getUrl(cluster), PLUGINS);
  const options = _.extend({ uri: URI, json: true });

  if (enabledOnly === true) {
    options.uri += ENABLED;
  }

  options.qs = {
    size: 1000
  };

  return request.get(options);
};

/**
 * Get one plugin
 * GET /plugins/:id
 */
exports.getPlugin = (cluster, id) => {
  const URI = util.format('%s%s/%s', KongUtils.getUrl(cluster), PLUGINS, id);
  const options = _.extend({ uri: URI, json: true });

  return request.get(options);
};

/**
 * Add plugin
 * GET /plugins/:id
 *
 * You can add a plugin in four different ways:
 * - For every API and Consumer. Don't set api_id and consumer_id.
 * - For every API and a specific Consumer. Only set consumer_id.
 * - For every Consumer and a specific API. Only set api_id.
 * - For a specific Consumer and API. Set both api_id and consumer_id.
 *
 * In our case, the apiId is constructed from the namespace, based on namespace's ingress labels.
 * Also, we NEVER specify a consumer_id. APIs and Consumers are linked via an ACL group.
 */
exports.addPlugin = (cluster, namespace, name, config) => {

  if (!namespace) {
    return Promise.reject('Namespace is required');
  }

  if (!name) {
    return Promise.reject('Plugin name is required');
  }

  if (!config) {
    return Promise.reject('Plugin config is required');
  }

  return getApiUsernameFromNamespace(namespace)
    .then(apiName => {
      let URI = `${KongUtils.getUrl(cluster)}${APIS}/${apiName}${PLUGINS}`;

      const options = {
        uri: URI,
        body: {
          name,
          config
        },
        json: true
      };

      return request.post(options);
    });
};

exports.updatePlugin = (cluster, id, namespace, name, config, enabled) => {

  if (!id) {
    return Promise.reject('Plugin id is required');
  }

  if (!namespace) {
    return Promise.reject('Namespace is required');
  }

  if (!name) {
    return Promise.reject('Plugin name is required');
  }

  if (!config) {
    return Promise.reject('Plugin config is required');
  }

  return getApiUsernameFromNamespace(namespace)
    .then(apiName => {
      let URI = `${KongUtils.getUrl(cluster)}${APIS}/${apiName}${PLUGINS}`;

      const options = {
        uri: URI,
        body: {
          id,
          name,
          config,
          enabled,
          created_at: new Date().getTime()
        },
        json: true
      };

      return request.put(options);
    });
};

/**
 * Get plugin schema
 * GET /plugins/schema/:name
 */
exports.getPluginSchema = (cluster, pluginName) => {
  const URI = util.format('%s%s%s/%s', KongUtils.getUrl(cluster), PLUGINS, SCHEMA, pluginName);
  const options = _.extend({ uri: URI, json: true });

  let pluginDescription;
  try {
    pluginDescription = require(`../../config/kong-plugins/${pluginName}.json`);
  } catch (e) {
    console.error('No plugin description for', pluginName);
  }

  return request.get(options)
    .then(schema => {
      // merge plugin's description with its schema, if available
      if (pluginDescription) {
        schema = _.merge(schema, pluginDescription);
      }

      return schema;
    });
};

// APIs

/**
 * Get APIs
 * GET /apis
 */
exports.getApis = (cluster) => {
  const URI = util.format('%s%s', KongUtils.getUrl(cluster), APIS);
  const options = _.extend({ uri: URI, json: true });

  options.qs = {
    size: 1000
  };

  return request.get(options)
    .then(apisList => {
      // keep only APIs that end with `.api.ypcgw`
      apisList.data = apisList.data
        .filter(api => api.name && api.name.endsWith('.api.ypcgw'));

      return apisList;
    });
};

/**
 * Get API by name
 * GET /apis/:id
 */
exports.getApi = (cluster, namespace) => {
  return getApiUsernameFromNamespace(namespace)
    .then(apiName => {
      const URI = util.format('%s%s/%s', KongUtils.getUrl(cluster), APIS, apiName);
      const options = _.extend({ uri: URI, json: true });

      return request.get(options);
    });
};

/**
 * Get api plugins
 * GET /apis/:id/plugins
 */
exports.getApiPlugins = (cluster, namespace) => {
  return getApiUsernameFromNamespace(namespace)
    .then(apiName => {
      const URI = util.format('%s%s/%s%s', KongUtils.getUrl(cluster), APIS, apiName, PLUGINS);
      const options = _.extend({ uri: URI, json: true });

      return request.get(options);
    });
};

/**
 * Get api plugins
 * GET /apis/:id/plugins
 */
exports.checkPluginsDocs = (cluster) => {
  const missingPluginsFields = {};

  return Promise.resolve()
    .then(() => this.getPlugins(cluster, true))
    .then(response => response.enabled_plugins)
    .map(pluginName => this.getPluginSchema(cluster, pluginName)
      .then(schema => ({ plugin: pluginName, schema })))
    .then(allPluginsSchema => {
      // loops through all plugins, and keep fields with missing `description` only
      _.each(allPluginsSchema, pluginSchema => {
        if (!pluginSchema.schema.description) {
          missingPluginsFields[pluginSchema.plugin] = ['Plugin Description'];
        }

        _.forOwn(pluginSchema.schema.fields, (field, fieldKey) => {
          if (!field.description) {
            if (!missingPluginsFields[pluginSchema.plugin]) {
              missingPluginsFields[pluginSchema.plugin] = [];
            }

            missingPluginsFields[pluginSchema.plugin].push(fieldKey);
          }
        });
      });

      return missingPluginsFields;
    });
};

// takes a namespace, fetches its ingresses, and constructs its Kong API Name
// as $serviceName.$serviceVersion.$serviceGroup.$namespace.api.ypcgw
// e.g. console.cloud.v1.console-develop.api.ypcgw
// used in getApiPlugin and getApi
function getApiUsernameFromNamespace (namespace) {
  return KubernetesService.getAllNamespaceIngressesServiceLabels(namespace)
    .then(ingressLabels => KongUtils.constructApiName(ingressLabels, namespace));
}
