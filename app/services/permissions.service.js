const _ = require('lodash');
const BitbucketService = require('../services/bitbucket.service');
const PermissionModel = require('../models/permission.model');
const UserModel = require('../models/user.model');
const ProjectModel = require('../models/project.model');

/**
 * Step 1: Get all projects from our DB
 * Step 2: Get user's Bitbucket Repositories
 * Step 3: Filter out namespaces not matching user's repos
 * Step 4: Construct our Namespace objects
 * Step 5: Save matched namespaces to User.namespaces array
 * Step 6: Get user's new namespaces, populated
 */
exports.updateNamespacePermissions = (username) => {

  let user;
  let dbProjects = [];

  UserModel.findByUsername(username)
    .then((dbUser) => {
      user = dbUser;

      // Step 1
      return ProjectModel.find();
    })
    .then(projects => {
      dbProjects = projects;

      // Step 2
      return BitbucketService.getUserRepositories(user);
    })
    .then(userRepositories => {
      const intersection = _.intersectionWith(dbProjects, userRepositories, (dbProject, userRepository) => {
        const dbProjectName = _.get(dbProject, 'name');
        const userRepositoryKey = _.get(userRepository, 'project.key');
        const userRepositorySlug = _.get(userRepository, 'slug');
        const userProjectName = `${userRepositoryKey}/${userRepositorySlug}`;

        return dbProjectName === userProjectName;
      });

      const intersectionIds = _.map(intersection, '_id');

      return PermissionModel.findOneAndUpdate(
        { username },
        {
          projects: intersectionIds,
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        });
    })
    .catch(function (error) {
      return new Error(error);
    });
};
