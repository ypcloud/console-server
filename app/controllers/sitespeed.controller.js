const httpStatus = require('http-status');
const SiteSpeedService = require('../services/sitespeed.service');

/**
 * Get CronJobs
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.listCronJobs = (req, res, next) => {
  const username = req.user.username;

  SiteSpeedService.listCronJobs(username)
    .then((cronjobs) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: cronjobs
      });
    })
    .catch(() => {
      next(new Error('Error getting sitespeed cronjobs'));
    });
};

/**
 * Create CronJob
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.createCronJob = (req, res, next) => {
  const username = req.user.username;
  const name = req.body.name;
  const schedule = req.body.schedule;
  const urls = req.body.urls;
  const args = req.body.args;

  SiteSpeedService.createCronJob(username, name, schedule, urls, args)
    .then((cronjob) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: cronjob
      });
    })
    .catch(() => {
      next(new Error('Error creating sitespeed cronjob'));
    });
};

/**
 * Update CronJob
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.updateCronJob = (req, res, next) => {
  const username = req.user.username;
  const name = req.params.name;
  const schedule = req.body.schedule;
  const urls = req.body.urls;
  const args = req.body.args;

  SiteSpeedService.updateCronJob(username, name, schedule, urls, args)
    .then((cronjob) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: cronjob
      });
    })
    .catch(() => {
      next(new Error('Error updating sitespeed cronjob'));
    });
};

/**
 * Delete CronJob
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.deleteCronJob = (req, res, next) => {
  const username = req.user.username;
  const name = req.params.name;

  SiteSpeedService.deleteCronJob(username, name)
    .then((cronjob) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: cronjob
      });
    })
    .catch(() => {
      next(new Error('Error deleting sitespeed cronjob'));
    });
};

/**
 * Get CronJob S3 Reports
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getCronJobS3Reports = (req, res, next) => {
  const name = req.params.name;

  SiteSpeedService.getCronJobS3Reports(name)
    .then((reports) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: reports
      });
    })
    .catch(() => {
      next(new Error('Error getting sitespeed reports'));
    });
};
