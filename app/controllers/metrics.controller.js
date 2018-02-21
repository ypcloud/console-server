const httpStatus = require('http-status');
const MetricsService = require('../services/metrics.service');

/**
 * Get Latest Metric
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getLatestMetric = (req, res, next) => {
  const type = req.params.type;

  MetricsService.getLatestMetric(type)
    .then(metric => {
      res.status(httpStatus.OK).json({
        result: true,
        data: metric
      });
    })
    .catch(() => next(new Error('Error getting metric')));
};
