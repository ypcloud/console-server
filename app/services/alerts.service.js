const _ = require('lodash');
const config = require('../../config');

/**
 * Gets alerts from Consul
 * GET /alerts
 */
exports.getAlerts = () => {
  const alerts = _.get(config, 'alerts', []);
  return Promise.resolve(alerts.filter(alert => alert.isActive));
};
