const httpStatus = require('http-status');
const UptimeService = require('../services/uptime.service');

/**
 * Get SLA
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getSLA = (req, res, next) => {
  UptimeService.getSLA(req.query)
    .then((events) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: events
      });
    })
    .catch((error) => {
      next(new Error('Error getting SLA'));
      console.log('ERROR', error);
    });
};

/**
 * Get Uptimes
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getUptimes = (req, res, next) => {
  UptimeService.getUptimes(req.query)
    .then((uptimes) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: uptimes
      });
    })
    .catch((error) => {
      next(new Error('Error getting uptimes'));
      console.log('ERROR', error);
    });
};

/**
 * Get Downtimes
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getDowntimes = (req, res, next) => {
  UptimeService.getDowntimes(req.query)
    .then((downtimes) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: downtimes
      });
    })
    .catch((error) => {
      next(new Error('Error getting downtimes'));
      console.log('ERROR', error);
    });
};

/**
 * Get Infras
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getInfras = (req, res, next) => {
  UptimeService.getInfras(req.query)
    .then((infras) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: infras
      });
    })
    .catch((error) => {
      next(new Error('Error getting infras'));
      console.log('ERROR', error);
    });
};

/**
 * Get Infras Uptimes
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getInfrasUptimes = (req, res, next) => {
  UptimeService.getInfrasUptimes(req.query)
    .then((uptimes) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: uptimes
      });
    })
    .catch((error) => {
      next(new Error('Error getting infras uptimes'));
      console.log('ERROR', error);
    });
};
