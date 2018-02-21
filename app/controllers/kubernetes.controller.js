const httpStatus = require('http-status');
const K8SUtils = require('../utils/kubernetes.utils');
const KubernetesService = require('../services/kubernetes.service');
const KubernetesHeapsterService = require('../services/kubernetes.heapster.service');
const ProjectModel = require('../models/project.model');
const config = require('../../config/index');

const MAXIMUM_DEPLOYMENT_SCALE = config.kubernetes.maximumDeploymentScale || 5;

/**
 * Get Kubernetes' Namespace from AWS and GCE, and merge them
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaces = (req, res, next) => {
  KubernetesService.getNamespaces()
    .then((namespaces) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: namespaces
      });
    })
    .catch(() => next(new Error('Error getting namespaces')));
};

/**
 * Get Kubernetes' Nodes CPU/Memory Resources
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNodesResources = (req, res, next) => {
  KubernetesService.getNodesResources()
    .then((resources) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: resources
      });
    })
    .catch(() => next(new Error('Error getting nodes resources')));
};

/**
 * Get Kubernetes' Namespace CPU/Memory Resources
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceResources = (req, res, next) => {
  const namespace = req.params.namespace;

  KubernetesHeapsterService.getNamespaceResources(namespace)
    .then((resources) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: resources
      });
    })
    .catch(() => next(new Error('Error getting namespace resources')));
};

/**
 * Get Kubernetes' Pod CPU/Memory Resources
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getPodResources = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;
  const pod = req.params.pod;

  KubernetesHeapsterService.getPodResources(cluster, namespace, pod)
    .then((resources) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: resources
      });
    })
    .catch(() => next(new Error('Error getting namespace resources')));
};

/**
 * Get Kubernetes' Deployment Pods
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getDeploymentPods = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;
  const deployment = req.params.deployment;

  KubernetesService.getDeploymentPods(cluster, namespace, deployment)
    .then((pods) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: pods
      });
    })
    .catch(() => next(new Error('Error getting deployment pods')));
};

/**
 * Get Kubernetes' Namespace Ingresses
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceIngresses = (req, res, next) => {
  const namespace = req.params.namespace;

  KubernetesService.getAllNamespaceIngressesHosts(namespace)
    .then((ingresses) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: ingresses
      });
    })
    .catch(() => next(new Error('Error getting namespace ingresses')));
};

/**
 * Get Kubernetes' Namespace Config Maps
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceConfigMaps = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;

  KubernetesService.getNamespaceConfigMaps(cluster, namespace)
    .then((configmaps) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: configmaps
      });
    })
    .catch(() => next(new Error('Error getting namespace config maps')));
};

/**
 * Get Kubernetes' Namespace Ingresses Service Labels
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceIngressesServiceLabels = (req, res, next) => {
  const namespace = req.params.namespace;

  KubernetesService.getAllNamespaceIngressesServiceLabels(namespace)
    .then((ingresses) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: ingresses
      });
    })
    .catch(() => next(new Error('Error getting namespace ingresses service labels')));
};

/**
 * Get Kubernetes' Service URL
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getServiceUrl = (req, res, next) => {
  const namespace = req.params.namespace;

  KubernetesService.getServiceUrl(namespace)
    .then((serviceUrl) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: serviceUrl
      });
    })
    .catch(() => next(new Error('Error getting service url')));
};

/**
 * Get Kubernetes' Upstream URL
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getServiceUpstreamUrl = (req, res, next) => {
  const namespace = req.params.namespace;

  KubernetesService.getServiceUpstreamUrl(namespace)
    .then((serviceUrl) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: serviceUrl
      });
    })
    .catch(() => next(new Error('Error getting service upstream url')));
};

/**
 * Get Kubernetes' Service Health
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getServiceHealth = (req, res) => {
  const namespace = req.params.namespace;

  KubernetesService.getServiceHealth(namespace)
    .then((health) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: health  // true or false
      });
    })
    .catch(() => {
      res.status(httpStatus.OK).json({
        result: true,
        data: null
      });
    });
};

/**
 * Get Kibana's Namespace Traffic Dashboard URL
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceKibanaDashboardURL = (req, res, next) => {
  const namespace = req.params.namespace;
  const isDarkTheme = req.query.isDarkTheme;

  KubernetesService.getNamespaceKibanaDashboardURL(namespace, isDarkTheme)
    .then((kibanaUrl) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: kibanaUrl
      });
    })
    .catch(() => next(new Error('Error getting Kibana Dashboard URL')));
};

/**
 * Get Kubernetes' Namespace deployments
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceDeployments = (req, res, next) => {
  const namespace = req.params.namespace;

  KubernetesService.getAllNamespaceDeployments(namespace)
    .then((deploymentObjects) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: deploymentObjects.map(deploymentsObject => ({
          cluster: deploymentsObject.cluster,
          deployments: deploymentsObject.deployments.map(deploymentObject => K8SUtils.stripDeploymentSecrets(deploymentObject))
        }))
      });
    })
    .catch(() => next(new Error('Error getting namespace deployments')));
};

/**
 * Get Kubernetes' Namespace events
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNamespaceEvents = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;
  const type = req.query.type;

  KubernetesService.getNamespaceEvents(cluster, namespace, type)
    .then((eventObjects) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: eventObjects
      });
    })
    .catch(() => next(new Error('Error getting namespace events')));
};

/**
 * Get Kubernetes' pod logs
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getPodLogs = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;
  const pod = req.params.pod;
  const container = req.query.container;
  const previous = req.query.previous;

  KubernetesService.getPodLogs(cluster, namespace, pod, container, previous)
    .then((response) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: response
      });
    })
    .catch(() => next(new Error('Error getting pod logs')));
};

/**
 * Delete Kubernetes' Namespace pod
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.deletePod = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;
  const pod = req.params.pod;

  KubernetesService.deletePod(cluster, namespace, pod)
    .then((response) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: response
      });

      ProjectModel.findOneByNamespace(namespace)
        .then(project => {
          res.locals.event = {
            namespace: namespace,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: 'terminated',
            what: `pod ${cluster}.${pod}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', namespace));
    })
    .catch(() => next(new Error('Error terminating pod')));
};

/**
 * Patch Kubernetes' deployment scale
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.patchDeploymentScale = (req, res, next) => {
  const cluster = req.params.cluster;
  const namespace = req.params.namespace;
  const deployment = req.params.deployment;
  const scale = req.body.scale;

  if (!scale && scale !== 0) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'Scale is required'
    });
  }

  if (isNaN(scale)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: 'Scale is not a number'
    });
  }

  if (scale > MAXIMUM_DEPLOYMENT_SCALE) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: `Can not scale above ${MAXIMUM_DEPLOYMENT_SCALE} pods`
    });
  }

  const body = {
    spec: {
      replicas: Number(scale)
    }
  };

  KubernetesService.patchDeploymentScale(cluster, namespace, deployment, body)
    .then((scaledDeployment) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: scaledDeployment
      });

      ProjectModel.findOneByNamespace(namespace)
        .then(project => {
          res.locals.event = {
            namespace: namespace,
            project: {
              owner: project.repository.owner,
              repo: project.repository.name
            },
            type: 'scaled',
            what: `deployment ${cluster}.${deployment}`,
            extra: `to ${scale}`
          };

          // next middleware: publish event
          next();
        })
        .catch(() => console.log('Error finding project from namespace', namespace));
    })
    .catch(() => next(new Error('Error scaling deployment')));
};
