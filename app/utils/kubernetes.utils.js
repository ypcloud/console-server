const _ = require('lodash');
const isAdminUsername = require('../policies/isAdminUser').isAdminUsername;
const config = require('../../config');

exports.extractNamespaceName = (namespace) =>
  _.get(namespace, 'metadata.name', null);

exports.extractNamespaceRepo = (namespace) =>
  _.get(namespace, 'metadata.annotations[\'drone/repo\']', null);

exports.extractNamespaceRepoOwner = (namespace) =>
  _.split(this.extractNamespaceRepo(namespace), '/')[0] || null;

exports.extractNamespaceRepoName = (namespace) =>
  _.split(this.extractNamespaceRepo(namespace), '/')[1] || null;

exports.extractNamespaceRepoBranch = (namespace) =>
  _.get(namespace, 'metadata.annotations[\'drone/commit_branch\']', '');

exports.extractNamespaceNameWithoutEnvironment = (namespace, branch) => {
  if (!namespace) {
    return null;
  }

  if (!branch) {
    return namespace;
  }

  if (branch === 'master') {
    return namespace;
  } else if (namespace.endsWith('-qa') && branch.includes('release')) {
    return namespace.replace(new RegExp(/-qa$/), '');
  } else if (namespace.endsWith('-develop') && branch === 'develop') {
    return namespace.replace(new RegExp(/-develop$/), '');
  }
};

/**
 * Takes Namespace' name and branch, and returns the corresponding env
 *
 * @param namespace {String}
 * @param branch {String}
 * @returns {String}
 */
exports.extractNamespaceEnvironment = (namespace, branch) => {
  if (!namespace || !branch) {
    return null;
  }

  if (branch === 'master') {
    return 'prod';
  } else if (namespace.endsWith('-qa') && branch.includes('release')) {
    return 'qa';
  } else if (namespace.endsWith('-develop') && branch === 'develop') {
    return 'dev';
  }

  return null;
};

/**
 * Takes Kubernetes' deployment and extracts the environment variables
 * returns [] if not found
 *
 * @param deployment
 * @returns {Object}
 */
exports.extractDeploymentEnvironmentVariables = (deployment) =>
  _.get(deployment, 'spec.template.spec.containers[0].env', []);

/**
 * Takes Kubernetes' deployment environment variables and returns its value
 * returns true if found
 *
 * @param envVars
 * @param envVarName
 * @returns {String}
 */
exports.getEnvironmentVariableValue = (envVars, envVarName) => {
  const envVar = _.find(envVars, { name: envVarName });
  return _.get(envVar, 'value', null);
};

/**
 * Takes Kubernetes' ingresses.items and extracts the hosts from it
 *
 * @param ingresses
 * @returns {Array}
 */
exports.extractIngressesHosts = (ingresses) => {
  if (!ingresses) {
    return [];
  }

  const extractedHosts = [];

  _.each(ingresses, (ingress) => {
    _.each(ingress.spec.rules, (rule) => {
      extractedHosts.push(rule.host);
    });
  });

  return extractedHosts;
};

/**
 * Takes Kubernetes' ingresses ('items') and extracts the required labels from it
 * codekube.io/service.env
 * codekube.io/service.name
 * codekube.io/service.group
 * codekube.io/service.version
 *
 * @param ingresses
 * @returns {Object}
 */
exports.extractLabelsServiceAttributes = (ingresses) => {
  let extractedLabels = {};

  if (!ingresses) {
    return extractedLabels;
  }

  let ingressLabels = _.map(ingresses, 'metadata.labels');

  // after collecting labels from each ingress, merge them together
  ingressLabels = _.reduce(ingressLabels, _.extend);

  const neededLabels = [
    'codekube.io/service.name',
    'codekube.io/service.version',
    'codekube.io/service.group',
    'codekube.io/service.env'
  ];

  _.each(neededLabels, neededLabel => {
    extractedLabels[neededLabel] = _.get(ingressLabels, neededLabel, null);
  });

  // drop all null values
  extractedLabels = _.pickBy(extractedLabels, _.identity);

  return extractedLabels;
};

// Returns the maximum number of revisions
exports.getMaxRevisions = (deployments) => {
  if (!deployments) {
    return 0;
  }

  const revisions = _.map(deployments.items, 'metadata.annotations[\'deployment.kubernetes.io/revision\']');
  const max = _.maxBy(revisions, _.toInteger) || 0;

  return _.toInteger(max);
};

/**
 * Takes Kubernetes' deployment and strips out secrets
 *
 * @param deployment
 * @returns {Object}
 */
exports.stripDeploymentSecrets = (deployment) => {
  if (!deployment) {
    return null;
  }

  // strip env annotations
  deployment = _.omit(deployment, 'metadata.annotations[\'kubectl.kubernetes.io/last-applied-configuration\']');

  // strip containers env
  const strippedContainers = _.get(deployment, 'spec.template.spec.containers', [])
    .map(container => _.omit(container, 'env'));
  deployment = _.set(deployment, 'spec.template.spec.containers', strippedContainers);

  return deployment;
};

/**
 * Takes Kubernetes' pod and strips out secrets
 *
 * @param pod
 * @returns {Object}
 */
exports.stripPodSecrets = (pod) => {
  // strip containers env
  const strippedContainers = _.get(pod, 'spec.containers', [])
    .map(container => _.omit(container, 'env'));
  pod = _.set(pod, 'spec.containers', strippedContainers);

  return pod;
};

/**
 * Takes Kubernetes' deployments environment variables and looks for SOAJS_PROFILE env
 * returns true if found
 *
 * @param envVars
 * @returns {Boolean}
 */
exports.isSoaJSService = (envVars) =>
  (!!_.find(envVars, { name: 'SOAJS_PROFILE' })
    && !!_.find(envVars, { name: 'SOAJS_ENV' })
    && !!_.find(envVars, { name: 'SOAJS_SERVICE_NAME' }));

exports.getUrl = (cluster) =>
  _.get(config, `kubernetes.clusters.${cluster}.baseUrl`);

exports.getAuth = (cluster) => ({
  auth: {
    bearer: _.get(config, `kubernetes.clusters.${cluster}.token`)
  },
  strictSSL: false,
  json: true
});

/**
 * Takes Kubernetes' nodes list and sums the CPU
 * returns true if found
 *
 * @param nodes
 * @returns {Number}
 */
exports.getNodesTotalCPU = (nodes) => {
  if (!nodes) {
    return 0;
  }

  return _.sumBy(nodes, (node) => {
    const nodeCpu = _.get(node, 'status.capacity.cpu', 0);
    return _.toNumber(nodeCpu);
  });
};

/**
 * Takes Kubernetes' nodes list and sums the Memory
 * returns true if found
 *
 * @param nodes
 * @returns {Number}
 */
exports.getNodesTotalMemory = (nodes) => {
  if (!nodes) {
    return 0;
  }

  return _.sumBy(nodes, (node) => {
    let nodeCpu = _.get(node, 'status.capacity.memory', 0);
    nodeCpu = _.replace(nodeCpu, 'Ki', '');
    return _.toNumber(nodeCpu);
  });
};

/**
 * Takes Kubernetes' cronjob and removes secret args
 *
 * @param cronjob
 * @returns {Object}
 */
exports.removeCronJobSecretArgs = (cronjob) => {
  const containers = _.get(cronjob, 'spec.jobTemplate.spec.template.spec.containers', []);

  containers.forEach(container => {
    let args = _.get(container, 'args', []);

    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];

      if (arg && (arg.startsWith('--graphite.') || arg.startsWith('--s3.') || arg === '--outputFolder')) {
        args[i] = null;
        args[i + 1] = null;
      }
    }

    container.args = args.filter(arg => !!arg);
  });

  return cronjob;
};

/**
 * Takes Kubernetes' cronjob and removes ALL args
 *
 * @param cronjob
 * @returns {Object}
 */
exports.removeCronJobAllArgs = (cronjob) => {
  const containers = _.get(cronjob, 'spec.jobTemplate.spec.template.spec.containers', []);

  containers.forEach(container => {
    container.args = [];
  });

  return cronjob;
};

/**
 * Takes Kubernetes' cronjob and, if created by current user, remove only secret args.
 * Otherwise, remove ALL args
 *
 * @param username
 * @param cronjob
 * @returns {Object}
 */
exports.removeNonUserCronJobArgs = (username, cronjob) => {
  if (!cronjob) {
    return null;
  }

  const cronjobUsername = _.get(cronjob, 'metadata.annotations.username');
  return (username === cronjobUsername || isAdminUsername(username)) ? this.removeCronJobSecretArgs(cronjob) : this.removeCronJobAllArgs(cronjob);
};
