const httpStatus = require('http-status');
const BitbucketService = require('../services/bitbucket.service');

/**
 * Get Projects
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getProjects = (req, res, next) => {
  const user = req.user;

  BitbucketService.getUserProjects(user)
    .then((projects) => {
      projects.values = projects.values.map(project => ({ key: project.key, name: project.name }));

      res.status(httpStatus.OK).json({
        result: true,
        data: projects
      });
    })
    .catch((error) => next(new Error(error.message)));
};

/**
 * Get Project Repositories
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getProjectRepositories = (req, res, next) => {
  const user = req.user;
  const project = req.params.project;
  const inactiveOnly = req.query.inactiveOnly;

  Promise.resolve()
    .then(() => {
      if (inactiveOnly) {
        return BitbucketService.getInactiveProjectRepositories(user, project);
      } else {
        return BitbucketService.getProjectRepositories(user, project);
      }
    })
    .then((repos) => {
      repos.values = repos.values.map(repo => ({ slug: repo.slug, name: repo.name }));

      res.status(httpStatus.OK).json({
        result: true,
        data: repos
      });
    })
    .catch(() => next(new Error('Error getting project repositories')));
};
