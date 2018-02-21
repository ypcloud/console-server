const Promise = require('bluebird');
const Drone = require('drone-node');
const request = require('request-promise');
const _ = require('lodash');
const util = require('util');
const WebSocket = require('ws');
const config = require('../../config');

const DRONE_BASE_URL = config.drone.baseUrl;
const DRONE_TOKEN = config.drone.token;

const DRONE_COUNTER_BASE_URL = config.drone.deploymentsCounter.baseUrl;
const DRONE_COUNTER_KEY = config.drone.deploymentsCounter.key;

const drone = new Drone.Client({
  url: DRONE_BASE_URL,
  token: DRONE_TOKEN
});

/**
 * Get total count of deployments
 */
exports.getDeploymentsCount = () => {
  const options = {
    json: true,
    qs: {
      key: DRONE_COUNTER_KEY
    }
  };

  return request.get(DRONE_COUNTER_BASE_URL, options);
};

/**
 * Get all repos available to the authenticated user
 */
exports.getRepositories = () => {
  return drone.getRepos();
};

/**
 * Get all repos available to the authenticated user
 */
exports.getAllRepositories = () => {
  const URL = [DRONE_BASE_URL, 'api/user/repos'].join('/');
  const OPTIONS = {
    uri: URL,
    json: true,
    headers: {
      Authorization: 'Bearer ' + DRONE_TOKEN
    },
    qs: {
      all: true,
      flush: true
    }
  };

  return request.get(OPTIONS);
};

/**
 * Get one repo
 */
exports.getRepository = (owner, name) => {
  return drone.getRepo(owner, name);
};

/**
 * Get all repo's builds
 */
exports.getBuilds = (owner, name) => {
  return drone.getBuilds(owner, name);
};

/**
 * Get one repo's build
 */
exports.getBuild = (owner, name, number) => {
  return drone.getBuild(owner, name, number);
};

/**
 * Restart one repo's build
 */
exports.restartBuild = (owner, name, number) => {
  return drone.restartBuild(owner, name, number);
};

/**
 * Stop one repo's build
 */
exports.stopBuild = (owner, name, number, job) => {
  return drone.stopBuild(owner, name, number, job);
};

/**
 * Get latest build for repo
 * e.g. https://cicd.codekube.io/api/repos/CLOUD/dashboard/builds/latest?branch=develop
 */
exports.getLastBuild = (owner, name, branch) => {
  if (branch === 'release') {
    return this.getBuilds(owner, name)
      .then(builds => {
        // filter through the builds and return only the latest release one
        return _.find(builds, (build) => {
          return _.includes(build.branch, 'release/');
        });
      });

  } else {
    const URL = [DRONE_BASE_URL, 'api/repos', owner, name, 'builds/latest'].join('/');
    const OPTIONS = {
      uri: URL,
      json: true,
      headers: {
        Authorization: 'Bearer ' + DRONE_TOKEN
      },
      qs: {
        branch: branch
      }
    };

    return request.get(OPTIONS);
  }
};

/**
 * Get build's logs
 */
exports.getBuildLogs = (owner, name, number, job) => {
  return drone.getBuildLogs(owner, name, number, job);
};

/**
 * Stream build's logs
 */
exports.streamBuildLogs = (owner, name, number, job) => {
  const DRONE_WS_PROTOCOL = config.drone.secure ? 'wss://' : 'ws://';
  const DRONE_WS_BASE_URL = DRONE_WS_PROTOCOL + config.drone.dns;
  const DRONE_TOKEN = config.drone.token;
  const URI = util.format('%s/ws/logs/%s/%s/%s/%s?access_token=%s', DRONE_WS_BASE_URL, owner, name, number, job, DRONE_TOKEN);

  return new WebSocket(URI);
};

/**
 * Stream Drone Feed
 */
exports.streamFeed = () => {
  const DRONE_WS_PROTOCOL = config.drone.secure ? 'wss://' : 'ws://';
  const DRONE_WS_BASE_URL = DRONE_WS_PROTOCOL + config.drone.dns;
  const DRONE_TOKEN = config.drone.token;
  const URI = util.format('%s/ws/feed?access_token=%s', DRONE_WS_BASE_URL, DRONE_TOKEN);

  return new WebSocket(URI);
};

/**
 * Get the number of unique contributors from all repositories in Drone
 *
 * 1) Get all repositories
 * 2) Get users from each repo's builds for each repository in allUsers[]
 * 3) Count unique builds author emails to get total number of users
 * 4) Loop through emails and remove duplicates ('xyz@gmail.com' VS 'xyz@pj.ca') and empty emails ('')
 *
 * Uncomment code to get all unique emails
 */
exports.countUsers = () => {
  let users = new Set();
  // let emails = new Set();

  return Promise.resolve()
    .then(() => this.getRepositories())
    .mapSeries(repo => {
      return Promise.resolve()
        .then(() => this.getBuilds(repo.owner, repo.name))
        .map(build => {
          const user = _.split(build.author_email, '@')[0];

          // if (!users.has(_.toLower(user)) && _.includes(build.author_email, '@')) {
          //   emails.add(_.toLower(build.author_email));
          //   console.log('ADDED EMAIL', _.toLower(build.author_email));
          // }

          if (user) {
            users.add(_.toLower(user));
          }

          return user;
        });
    })
    .then(() => {
      // console.log('=== EMAILS START ===', emails.size);
      //
      // emails.forEach(email => {
      //   console.log(email);
      // });
      //
      // console.log('=== EMAILS END ===', emails.size);

      return users.size;
    });
};
