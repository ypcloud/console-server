const httpStatus = require('http-status');
const CostsService = require('../services/costs.service');

/**
 * Get costs
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getCosts = (req, res, next) => {
  const component = req.query.component;

  CostsService.getCosts(component)
    .then((costs) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: costs
      });
    })
    .catch(() => next(new Error('Error getting costs')));
};
