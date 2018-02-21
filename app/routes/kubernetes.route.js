const express = require('express');
const kubernetesCtrl = require('../controllers/kubernetes.controller');
const eventPublisher = require('../middlewares/publish-event').publishEvent;

const router = express.Router();

/** GET kubernetes/namespaces - Returns namespaces from AWS and GCE */
router.route('/namespaces')
  .get(kubernetesCtrl.getNamespaces);

/** GET kubernetes/namespaces/:namespace/ingresses - Returns all namespace ingresses */
router.route('/namespaces/:namespace/ingresses')
  .get(kubernetesCtrl.getNamespaceIngresses);

/** GET kubernetes/namespaces/:namespace/labels - Returns all namespace ingresses service labels */
router.route('/namespaces/:namespace/labels')
  .get(kubernetesCtrl.getNamespaceIngressesServiceLabels);

/** GET kubernetes/namespaces/:namespace/kibana-traffic-url - Returns Kibana's Namespace Traffic Dashboard URL */
router.route('/namespaces/:namespace/kibana-traffic-url')
  .get(kubernetesCtrl.getNamespaceKibanaDashboardURL);

/** GET kubernetes/namespaces/:namespace/service-url - Returns Kubernetes's Service URL */
router.route('/namespaces/:namespace/service-url')
  .get(kubernetesCtrl.getServiceUrl);

/** GET kubernetes/namespaces/:namespace/upstream-url - Returns Kubernetes's Upstream URL */
router.route('/namespaces/:namespace/upstream-url')
  .get(kubernetesCtrl.getServiceUpstreamUrl);

/** GET kubernetes/namespaces/:namespace/configmaps - Returns Kubernetes's Config Maps for a cluster */
router.route('/clusters/:cluster/namespaces/:namespace/configmaps')
  .get(kubernetesCtrl.getNamespaceConfigMaps);

/** GET kubernetes/namespaces/:namespace/health - Returns Kubernetes's Service Health */
router.route('/namespaces/:namespace/health')
  .get(kubernetesCtrl.getServiceHealth);

/** GET kubernetes/namespaces/:namespace/deployments - Returns all namespace deployments */
router.route('/namespaces/:namespace/deployments')
  .get(kubernetesCtrl.getNamespaceDeployments);

/** GET kubernetes/clusters/:cluster/namespaces/:namespace/events - Returns all namespace events */
router.route('/clusters/:cluster/namespaces/:namespace/events')
  .get(kubernetesCtrl.getNamespaceEvents);

/** GET kubernetes/namespaces/:namespace/deployments/:deployment/pods/:cluster - Returns all namespace deployment pods for a cluster */
router.route('/clusters/:cluster/namespaces/:namespace/deployments/:deployment/pods')
  .get(kubernetesCtrl.getDeploymentPods);

/** PATCH kubernetes/namespaces/:namespace/deployments/:deployment/scale - Returns scaled deployment */
router.route('/clusters/:cluster/namespaces/:namespace/deployments/:deployment/scale')
  .patch(kubernetesCtrl.patchDeploymentScale, eventPublisher);

/** GET kubernetes/clusters/:cluster/namespaces/:namespace/pods/:pod/logs - Returns pod logs */
router.route('/clusters/:cluster/namespaces/:namespace/pods/:pod/logs')
  .get(kubernetesCtrl.getPodLogs);

/** DELETE kubernetes/clusters/:cluster/namespaces/:namespace/pods/:pod - Returns deleted pod */
router.route('/clusters/:cluster/namespaces/:namespace/pods/:pod')
  .delete(kubernetesCtrl.deletePod, eventPublisher);

/** GET kubernetes/resources - Returns nodes resources from AWS and GCE */
router.route('/resources')
  .get(kubernetesCtrl.getNodesResources);

/** GET kubernetes/resources/:namespace - Returns namespace resources from AWS and GCE */
router.route('/namespaces/:namespace/resources')
  .get(kubernetesCtrl.getNamespaceResources);

/** GET kubernetes/resources/:namespace - Returns namespace resources from AWS and GCE */
router.route('/clusters/:cluster/namespaces/:namespace/pods/:pod/resources')
  .get(kubernetesCtrl.getPodResources);

module.exports = router;
