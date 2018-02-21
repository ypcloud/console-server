const _ = require('lodash');
const async = require('async');
const KubernetesService = require('./kubernetes.service');
const K8SUtils = require('../utils/kubernetes.utils');
const ProjectModel = require('../models/project.model');

/**
 * Get all Kubernetes projects and sync them with database's ones
 */
function syncProjects () {
  const projects = [];
  const clusters = KubernetesService.getClusters();

  async.forEach(clusters, (cluster, clusterDone) => {
    KubernetesService.getNamespacesByCluster(cluster)
      .then((namespaces) => {
        for (let j = 0; j < namespaces.length; j += 1) {
          const namespace = namespaces[j];
          const namespaceName = K8SUtils.extractNamespaceName(namespace);
          const repo = K8SUtils.extractNamespaceRepo(namespace);
          const branch = K8SUtils.extractNamespaceRepoBranch(namespace);
          const name = K8SUtils.extractNamespaceNameWithoutEnvironment(namespaceName, branch);
          const environment = K8SUtils.extractNamespaceEnvironment(namespaceName, branch);

          let project = _.find(projects, { name: repo });

          if (project) {
            let projectNamespace = _.find(project.namespaces, { name: namespaceName });

            if (projectNamespace) {
              projectNamespace.clusters = _.union(projectNamespace.clusters, [cluster]);
            } else {
              projectNamespace = {
                name: namespaceName,
                clusters: [cluster]
              };
              project.namespaces.push(projectNamespace);
            }

          } else {
            project = {
              name: repo,
              repository: {
                owner: K8SUtils.extractNamespaceRepoOwner(namespace),
                name: K8SUtils.extractNamespaceRepoName(namespace)
              },
              namespaces: [{
                name: namespaceName,
                clusters: [cluster]
              }],
            };

            if (project.repository.owner && project.repository.name) {
              projects.push(project);
            }
          }
        }

        clusterDone();
      })
      .catch(() => clusterDone());
  }, () => {
    _.each(projects, project =>
      ProjectModel.findOneAndUpdate(
        {
          name: project.name
        },
        project,
        {
          upsert: true,
          new: true,
          runValidators: true
        })
        .then(() => console.log('Project saved successfully:', project.name))
        .catch(() => console.log('Error saving project:', project.name))
    );
  });
}

module.exports = syncProjects;
