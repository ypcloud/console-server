const httpStatus = require('http-status');
const _ = require('lodash');
const ProjectModel = require('../models/project.model');
const KongService = require('../services/kong.service');
const KongUtils = require('../utils/kong.utils');

/**
 * Get Kong's Consumers
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getConsumers = (req, res, next) => {
  KongService.getConsumers('aws')
    .then(consumers => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumers
      });
    })
    .catch(() => next(new Error('Error getting consumers')));
};

/**
 * Get Kong's Consumer by namespace (Kong username)
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getConsumerByUsername = (req, res, next) => {
  const username = req.params.username;

  KongService.getConsumerByUsername('aws', username)
    .then(consumer => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumer
      });
    })
    .catch(() => next(new Error('Error getting consumer')));
};

/**
 * Get Kong's Consumer by namespace (Kong username)
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getConsumersByNamespace = (req, res, next) => {
  const username = req.params.namespace;

  KongService.getConsumersByNamespace('aws', username)
    .then(consumers => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumers
      });
    })
    .catch(() => next(new Error('Error getting consumers')));
};

/**
 * Create Kong's Consumer
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.createConsumer = (req, res, next) => {
  const username = req.body.username;

  KongService.createConsumer('aws', username)
    .then(consumer => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumer
      });

      const namespace = KongUtils.extractNamespaceFromConsumer(consumer);
      ProjectModel.findOneByNamespace(namespace)
        .then(project => {
          res.locals.event = {
            namespace: namespace,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: 'created',
            what: `consumer ${consumer.username}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', namespace));
    })
    .catch(next);
};

/**
 * Get Kong Consumer's Plugin Config
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getConsumerPluginConfig = (req, res, next) => {
  const username = req.params.username;
  const pluginName = req.params.pluginName;

  KongService.getConsumerPluginConfig('aws', username, pluginName)
    .then(consumerPluginConfig => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumerPluginConfig
      });
    })
    .catch(next);
};

/**
 * Create Kong Consumer's Plugin Config
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.createConsumerPluginConfig = (req, res, next) => {
  const username = req.params.username;
  const pluginName = req.params.pluginName;
  const namespace = req.body.namespace;
  const config = req.body.config;

  KongService.createConsumerPluginConfig('aws', username, pluginName, namespace, config)
    .then(consumerPluginConfig => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumerPluginConfig
      });

      ProjectModel.findOneByNamespace(namespace)
        .then(project => {
          res.locals.event = {
            namespace: namespace,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: 'created',
            what: `${pluginName} plugin config for consumer ${username}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', namespace));
    })
    .catch(error => {
      res.status(httpStatus.BAD_REQUEST).json({
        result: false,
        data: error.error || error.message
      });
    });
};

/**
 * Delete Kong Consumer's Plugin Config
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.deleteConsumerPluginConfig = (req, res, next) => {
  const username = req.params.username;
  const pluginName = req.params.pluginName;
  const configId = req.params.configId;

  KongService.deleteConsumerPluginConfig('aws', username, pluginName, configId)
    .then(consumerPluginConfig => {
      res.status(httpStatus.OK).json({
        result: true,
        data: consumerPluginConfig
      });

      const namespace = KongUtils.extractNamespaceFromConsumerUsername(username);
      ProjectModel.findOneByNamespace(namespace)
        .then(project => {
          res.locals.event = {
            namespace: namespace,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: 'deleted',
            what: `${pluginName} plugin config for consumer ${username}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', namespace));
    })
    .catch(next);
};

/**
 * Delete Kong's Consumer
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.deleteConsumer = (req, res, next) => {
  const username = req.params.username;

  KongService.deleteConsumer('aws', username)
    .then(() => {
      res.status(httpStatus.OK).json({
        result: true,
        data: true
      });
    })
    .catch(() => next(new Error('Error deleting consumer')));
};

/**
 * GET Kong's Plugins
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getPlugins = (req, res, next) => {
  KongService.getPlugins('aws')
    .then(plugins => {
      res.status(httpStatus.OK).json({
        result: true,
        data: plugins
      });
    })
    .catch(() => next(new Error('Error getting plugins')));
};

/**
 * GET Kong's Enabled Plugins
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getEnabledPlugins = (req, res, next) => {
  KongService.getPlugins('aws', true)
    .then(plugins => {
      const activePlugins = KongUtils.getActivePlugins();
      const intersectionPlugins = _.intersection(activePlugins, plugins.enabled_plugins);

      res.status(httpStatus.OK).json({
        result: true,
        data: intersectionPlugins
      });
    })
    .catch(error => {
      console.log('ERROR', error);
      next(new Error('Error getting enabled plugins'));
    });
};

/**
 * GET Kong's Plugin by id
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getPlugin = (req, res, next) => {
  const id = req.params.id;

  KongService.getPlugin('aws', id)
    .then(plugin => {
      res.status(httpStatus.OK).json({
        result: true,
        data: plugin
      });
    })
    .catch(() => next(new Error('Error getting plugin')));
};

/**
 * POST Add Kong's Plugin
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.addPlugin = (req, res, next) => {
  const apiId = req.params.id;
  const name = req.body.name;
  const config = req.body.config;

  KongService.addPlugin('aws', apiId, name, config)
    .then(plugin => {
      res.status(httpStatus.OK).json({
        result: true,
        data: plugin
      });

      // frontend always passes namespace instead of apiId
      ProjectModel.findOneByNamespace(apiId)
        .then(project => {
          res.locals.event = {
            namespace: apiId,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: 'enabled',
            what: `plugin ${name}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', apiId));
    })
    .catch(next);
};

exports.updatePlugin = (req, res, next) => {
  const apiId = req.params.id;
  const id = req.body.id; // plugin's id to update
  const name = req.body.name;
  const config = req.body.config;
  const enabled = req.body.enabled;

  KongService.updatePlugin('aws', id, apiId, name, config, enabled)
    .then(plugin => {
      res.status(httpStatus.OK).json({
        result: true,
        data: plugin
      });

      // frontend always passes namespace instead of apiId
      ProjectModel.findOneByNamespace(apiId)
        .then(project => {
          res.locals.event = {
            namespace: apiId,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: (enabled === false) ? 'disabled' : 'updated',
            what: `plugin ${name}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', apiId));
    })
    .catch(next);
};

/**
 * GET Kong's Plugin Schema
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getPluginSchema = (req, res, next) => {
  const name = req.params.name;

  KongService.getPluginSchema('aws', name)
    .then(schema => {
      res.status(httpStatus.OK).json({
        result: true,
        data: schema
      });
    })
    .catch(() => next(new Error('Error getting plugin schema')));
};

/**
 * GET Kong's APIs
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getApis = (req, res, next) => {
  KongService.getApis('aws')
    .then(apis => {
      res.status(httpStatus.OK).json({
        result: true,
        data: apis
      });
    })
    .catch(() => next(new Error('Error getting APIs')));
};

/**
 * GET Kong's API
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getApi = (req, res, next) => {
  const id = req.params.id;

  KongService.getApi('aws', id)
    .then(api => {
      res.status(httpStatus.OK).json({
        result: true,
        data: api
      });
    })
    .catch(() => next(new Error('Error getting API')));
};

/**
 * GET Kong's API Plugins
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getApiPlugins = (req, res) => {
  const id = req.params.id;

  KongService.getApiPlugins('aws', id)
    .then(plugins => {
      res.status(httpStatus.OK).json({
        result: true,
        data: plugins
      });
    })
    .catch(() => {
      res.status(httpStatus.OK).json({
        result: true,
        data: null
      });
    });
};

/**
 * GET Kong's Plugins Docs
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.checkPluginsDocs = (req, res, next) => {
  KongService.checkPluginsDocs('aws')
    .then(docs => {
      res.status(httpStatus.OK).json({
        result: true,
        data: docs
      });
    })
    .catch(error => {
      console.log('ERROR', error);
      next(new Error('Error getting plugins docs'));
    });
};
