const httpStatus = require('http-status');
const _ = require('lodash');
const SiteSpeedService = require('../services/sitespeed.service');
const isAdminUsername = require('./isAdminUser').isAdminUsername;

exports.isConsulKeyAllowed = (req, res, next) => {
  const name = req.params.name;
  const username = req.user.username;

  SiteSpeedService.getCronJob(name)
    .then(cronjob => {
      const cronjobUsername = _.get(cronjob, 'metadata.annotations.username');

      // if current user is the creator of the CronJob, allow him
      if (username === cronjobUsername || isAdminUsername(username)) {
        next();
      } else {
        res.status(httpStatus.UNAUTHORIZED).send({ error: 'Unauthorized' });
      }
    })
    .catch(() => res.status(httpStatus.UNAUTHORIZED).send({ error: 'Unauthorized ' }));
};
