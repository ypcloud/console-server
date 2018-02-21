const httpStatus = require('http-status');
const _ = require('lodash');
const PermissionModel = require('../models/permission.model');
const isAdminUsername = require('./isAdminUser').isAdminUsername;

const whitelist = ['dev', 'qa', 'prod'];

exports.isConsulKeyAllowed = (req, res, next) => {
  const project = res.locals.project;
  const username = req.user ? req.user.username : null;

  // only admins can read/write CLOUD configs
  if (project.owner === 'CLOUD' && !isAdminUsername(username)) {
    return res.status(httpStatus.UNAUTHORIZED).send({ error: 'Unauthorized' });
  }

  let keyToAuthorize = `${project.owner}/`;

  // If the repo PROJECT/REPO is in the whitelist,
  // or if we have a file instead of repo, allow it
  // by not looking for it as a Bitbucket Repo
  if (project.repo && !whitelist.includes(project.repo)) {
    keyToAuthorize += project.repo;
  }

  PermissionModel.getUserProjects(username)
    .then(projects => {
      const found = _.find(projects, (p) => _.startsWith(p.name, keyToAuthorize));

      if (found) {
        next();
      } else {
        res.status(httpStatus.UNAUTHORIZED).send({ error: 'Unauthorized' });
      }
    });
};
