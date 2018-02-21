const Promise = require('bluebird');
const _ = require('lodash');
const BitbucketClient = require('bitbucket-server-nodejs').Client;
const DroneService = require('./drone.service');
const CryptoUtils = require('../utils/crypto.utils');
const config = require('../../config/index');

const BASE_URL = config.bitbucket.baseUrl;
const SECRET_KEY = config.bitbucket.secretKey;

/**
 * Bitbucket User Projects
 */
exports.getUserProjects = (user) => {
  const oauth = getOAuth(user);
  const bitbucketClient = new BitbucketClient(BASE_URL, oauth);

  return bitbucketClient.projects.get();
};

/**
 * Bitbucket User Repositories
 * ** Returns an array of repos, not a Bitbucket Repo object, with repos.values **
 */
exports.getUserRepositories = (user) => {
  const oauth = getOAuth(user);
  const bitbucketClient = new BitbucketClient(BASE_URL, oauth);

  return bitbucketClient.repos.getAll();
};

/**
 * Bitbucket User Repositories
 * Returns an array of repos, not a Bitbucket Repo object, with repos.values
 */
exports.getProjectRepositories = (user, project) => {
  const oauth = getOAuth(user);
  const bitbucketClient = new BitbucketClient(BASE_URL, oauth);

  return bitbucketClient.repos.get(project);
};

/**
 * Drone User Repositories
 * Returns an array of repos, not active in Drone
 * Active if `allow_pr` and `allow_push` are both true
 */
exports.getInactiveProjectRepositories = (user, project) => {

  return Promise.all([this.getProjectRepositories(user, project), DroneService.getAllRepositories()])
    .then((response) => {
      const bitbucketRepos = response[0];
      const droneRepos = response[1];

      bitbucketRepos.values = _.filter(bitbucketRepos.values, (br) => {
        return !!_.find(droneRepos, { owner: project, name: br.slug, allow_pr: false, allow_push: false });
      });

      return bitbucketRepos;
    });
};

function getOAuth (user) {
  return {
    consumer_key: config.bitbucket.consumerKey,
    consumer_secret: config.bitbucket.consumerSecret,
    token: CryptoUtils.decrypt(user.bitbucket.token, SECRET_KEY),
    token_secret: CryptoUtils.decrypt(user.bitbucket.tokenSecret, SECRET_KEY),
    signature_method: config.bitbucket.signatureMethod,
    type: 'oauth'
  };
}
