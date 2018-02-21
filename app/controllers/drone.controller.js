const httpStatus = require('http-status');
const DroneService = require('../services/drone.service');
const _ = require('lodash');

/**
 * Get total count of deployments
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getDeploymentsCount = (req, res, next) => {
  DroneService.getDeploymentsCount()
    .then((count) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: count
      });
    })
    .catch(() => next(new Error('Error getting deployments count')));
};

/**
 * Get all builds
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getBuilds = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;

  DroneService.getBuilds(owner, name)
    .then((builds) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: builds.slice(0, 100)
      });
    })
    .catch(() => next(new Error('Error getting builds')));
};

/**
 * Get all contributors
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getContributors = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;

  DroneService.getBuilds(owner, name)
    .then((builds) => {
      const contributors = [];

      // group all builds by their author
      const buildsByAuthors = _.groupBy(builds, 'author');

      // populate contributors array with those groups
      _.each(buildsByAuthors, (authorBuilds, author) => {
        contributors.push({
          name: author,
          avatar: authorBuilds[0].author_avatar,
          commitsCount: authorBuilds.length,
        });
      });

      // sort by authors' number of commits
      return _.orderBy(contributors, 'commitsCount', 'desc');
    })
    .then((contributors) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: contributors
      });
    })
    .catch(() => next(new Error('Error getting contributors')));
};

/**
 * Get one build
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getBuild = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;
  const number = req.params.number;

  DroneService.getBuild(owner, name, number)
    .then((build) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: build
      });
    })
    .catch(() => next(new Error('Error getting build')));
};

/**
 * Get latest build
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getLatestBuild = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;
  const branch = req.query.branch;

  DroneService.getLastBuild(owner, name, branch)
    .then((project) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: project
      });
    })
    .catch(() => next(new Error('Error getting latest build')));
};

/**
 * Restart build
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.restartBuild = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;
  const number = req.params.number;

  DroneService.restartBuild(owner, name, number)
    .then((build) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: build
      });
    })
    .catch(() => next(new Error('Error restarting build')));
};

/**
 * Stop build
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.stopBuild = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;
  const number = req.params.number;
  const job = req.params.job;

  DroneService.stopBuild(owner, name, number, job)
    .then((build) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: build
      });
    })
    .catch(() => next(new Error('Error stopping build')));
};

/**
 * Get build logs
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getBuildLogs = (req, res, next) => {
  const owner = req.params.owner;
  const name = req.params.name;
  const number = req.params.number;
  const job = req.params.job;

  DroneService.getBuildLogs(owner, name, number, job)
    .then((logs) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: logs
      });
    })
    .catch(() => next(new Error('Error getting build logs')));
};
