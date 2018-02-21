const httpStatus = require('http-status');
const ProvisionsService = require('../services/provisions.service');

/**
 * Check DNS Availability
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.checkDNS = (req, res, next) => {
  ProvisionsService.checkDNS(req.query)
    .then((response) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: response
      });
    })
    .catch(() => next(new Error('Error checking DNS')));
};

/**
 * Init New Project
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.initNewProject = (req, res, next) => {
  const owner = req.params.owner;
  const repo = req.params.repo;
  const configs = req.body.configs;
  const requester = req.user.username;

  ProvisionsService.initNewProject(owner, repo, configs, requester)
    .then((response) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: response
      });
    })
    .catch(() => next(new Error('Error initializing new project')));
};

/**
 * Create Service Provisioning
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.provisionService = (req, res, next) => {
  const owner = req.params.owner;
  const repo = req.params.repo;
  const service = req.params.service;
  const config = req.body.config;
  const requester = req.user.username;

  ProvisionsService.provisionService(owner, repo, service, config, requester)
    .then((response) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: response
      });
    })
    .catch(() => next(new Error('Error provisioning service')));
};
