const httpStatus = require('http-status');
const _ = require('lodash');
const PermissionModel = require('../models/permission.model');

/**
 * Get all Projects from user's permissions,
 * Filter by user's permissions
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getProjects = (req, res, next) => {
  const username = req.user ? req.user.username : null;

  PermissionModel.getUserProjects(username)
    .then((projects) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: projects
      });
    })
    .catch(() => next(new Error('Error getting projects')));
};

/**
 * Get one Project by its name from user's permissions,
 * Filter by user's permissions
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getProjectByNamespace = (req, res, next) => {
  const namespace = req.params.namespace;
  const username = req.user ? req.user.username : null;

  PermissionModel.getUserProjects(username)
    .then((projects) => {
      const project = _.find(projects, (project) => !!_.find(project.namespaces, (projectNamespace) => projectNamespace.name === namespace));
      const status = project ? httpStatus.OK : httpStatus.NOT_FOUND;

      res.status(status).json({
        result: !!project,
        data: project
      });
    })
    .catch(() => next(new Error('Error getting project')));
};

/**
 * Search Projects by namespace from user's permissions,
 * Filter by user's permissions
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getProjectsByNamespace = (req, res, next) => {
  const namespace = req.params.namespace;
  const username = req.user ? req.user.username : null;

  const query = decodeURIComponent(namespace);
  const queryRegex = new RegExp(query.toLowerCase(), 'i');

  PermissionModel.getUserProjects(username)
    .then((projects) => {
      projects = _.filter(projects, (project) => {
        return project.name.match(queryRegex)
          || !!_.find(project.namespaces, (namespace) => namespace.name.match(queryRegex));
      });

      res.status(httpStatus.OK).json({
        result: true,
        data: projects
      });
    })
    .catch(() => next(new Error('Error getting projects')));
};
