const httpStatus = require('http-status');
const SonarService = require('../services/sonar.service');

/**
 * Get metrics
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getMetrics = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;
  const branch = req.params.branch;
  const metrics = req.query.metrics;

  SonarService.getMetrics(owner, name, branch, metrics)
    .then((metrics) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: metrics
      });
    })
    .catch(() => next(new Error('Error getting metrics')));
};

/**
 * Get all projects
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getProjects = (req, res, next) => {
  SonarService.getProjects()
    .then((projects) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: projects
      });
    })
    .catch(() => next(new Error('Error getting projects')));
};
