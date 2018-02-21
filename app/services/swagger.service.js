const request = require('request-promise');
const yaml = require('js-yaml');
const url = require('url');
const _ = require('lodash');
const KubernetesService = require('./kubernetes.service');
const KongService = require('./kong.service');

const SWAGGER = '/swagger.yaml';

/**
 * Get Swagger file via Kubernetes' internal url
 * and merge into it host/basePath/security/securityDefinitions
 */
exports.getSwaggerFile = (namespace) => {
  // will be parsed and set in swaggerFile.host, swaggerFile.basePath
  let swaggerJSON;

  return KubernetesService.getServiceUpstreamUrl(namespace)
    .then(upstreamUrl => request.get(`${upstreamUrl}${SWAGGER}`, { timeout: 1000 }))
    .then(swaggerFile => {
      if (_.isPlainObject(swaggerFile)) {
        // if we already have it as JSON, keep it as is
        swaggerJSON = swaggerFile;
      } else {
        // will throw if not able to convert it to JSON
        swaggerJSON = yaml.safeLoad(swaggerFile);
      }

      // frontend apps sometimes return html when accessing /swagger.yaml
      // which does not throw when trying to yaml.safeLoad it
      // we also reject fake Swaggers that don't have .swagger or .openapi version field (SoaJS)
      if (!swaggerJSON || !_.isPlainObject(swaggerJSON) || (!swaggerJSON.swagger && !swaggerJSON.openapi)) {
        swaggerJSON = null;
        throw new Error('Not a valid Swagger file');
      }

      return KubernetesService.getServiceUrl(namespace);
    })
    .then(serviceUrl => {
      const urlObject = url.parse(serviceUrl);

      // assign those values to swaggerJSON
      swaggerJSON.host = urlObject.host;
      swaggerJSON.basePath = urlObject.pathname;

      // if swaggerJSON.security is undefined or empty,
      // try getting its security config from Kong
      if (!swaggerJSON.security || swaggerJSON.security.length === 0) {
        return KongService.getApiPlugins('aws', namespace)
          .then(apiPlugins => {
            // find the key-auth plugin, enabled
            const keyAuthPlugin = _.find(apiPlugins.data, { name: 'key-auth', enabled: true });

            // if found, enable it in the swaggerJSON
            if (keyAuthPlugin) {
              swaggerJSON.security = [{ APIKeyHeader: [] }];
              swaggerJSON.securityDefinitions = {
                APIKeyHeader: {
                  in: 'header',
                  name: _.get(keyAuthPlugin, 'config.key_names[0]', 'key'),
                  type: 'apiKey'
                }
              };
            }

            return swaggerJSON;
          });
      } else {
        // if swaggerJSON.security is already define, just return it as is, without overriding
        return swaggerJSON;
      }
    })
    .catch((e) => {
      // if we already had a (real) swaggerJSON, but just
      // failed to set its host/basePath, return it
      if (swaggerJSON && _.isPlainObject(swaggerJSON)) {
        return swaggerJSON;
      } else {
        // else throw the error back
        throw e;
      }
    });
};
