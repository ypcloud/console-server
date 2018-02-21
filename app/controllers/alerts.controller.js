const httpStatus = require('http-status');
const AlertsService = require('../services/alerts.service');

/**
 * Get alerts from Consul
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getAlerts = (req, res, next) => {
  AlertsService.getAlerts()
    .then(alerts => {
      res.status(httpStatus.OK).json({
        result: true,
        data: alerts
      });
    })
    .catch(() => next(new Error('Error getting alerts')));
};
