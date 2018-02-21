const request = require('request-promise');
const Promise = require('bluebird');
const util = require('util');
const _ = require('lodash');
const KubernetesService = require('../services/kubernetes.service');
const KubernetesUtils = require('../utils/kubernetes.utils');

// https://github.com/kubernetes/heapster/blob/master/docs/model.md
// https://github.com/kubernetes/heapster/blob/master/docs/storage-schema.md
const HEAPSTER = '/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model';

const NAMESPACES = '/namespaces';
const PODS = '/pods';
const METRICS = '/metrics';

const MEMORY_USAGE = '/memory/usage';
const CPU_USAGE_RATE = '/cpu/usage_rate';

const NETWORK_RECEIVED_RATE = '/network/rx_rate';
const NETWORK_SENT_RATE = '/network/tx_rate';

exports.getNamespaceResources = (namespace) => {
  const clusters = KubernetesService.getClusters();

  return Promise.resolve(clusters)
    .map(cluster => this.getNamespaceResourcesByCluster(cluster, namespace)
      .then(resources => ({
        cluster: cluster,
        resources: resources
      })));
};

exports.getNamespaceResourcesByCluster = (cluster, namespace) => {
  return Promise.all([
    this.getNamespaceMemoryUsage(cluster, namespace)
      .then(memory => ({
        type: 'memory',
        data: memory,
      })),
    this.getNamespaceCPUUsageRate(cluster, namespace)
      .then(cpu => ({
        type: 'cpu',
        data: cpu,
      }))
  ]);
};

exports.getPodResources = (cluster, namespace, pod) => {
  return Promise.all([
    this.getPodMemoryUsage(cluster, namespace, pod)
      .then(memory => ({
        type: 'memory',
        data: memory,
      })),
    this.getPodCPUUsageRate(cluster, namespace, pod)
      .then(cpu => ({
        type: 'cpu',
        data: cpu,
      }))
  ]);
};

/**
 * Namespace Memory Usage
 * GET /memory/usage
 */
exports.getNamespaceMemoryUsage = function (cluster, namespace) {
  const URI = util.format('%s%s%s/%s%s%s', KubernetesUtils.getUrl(cluster), HEAPSTER, NAMESPACES, namespace, METRICS, MEMORY_USAGE);
  const options = _.extend(KubernetesUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Namespace CPU Usage Rate
 * GET /cpu/usage_rate
 */
exports.getNamespaceCPUUsageRate = function (cluster, namespace) {
  const URI = util.format('%s%s%s/%s%s%s', KubernetesUtils.getUrl(cluster), HEAPSTER, NAMESPACES, namespace, METRICS, CPU_USAGE_RATE);
  const options = _.extend(KubernetesUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Pod Memory Usage
 * GET /memory/usage
 */
exports.getPodMemoryUsage = function (cluster, namespace, pod) {
  const URI = util.format('%s%s%s/%s%s/%s%s%s', KubernetesUtils.getUrl(cluster), HEAPSTER, NAMESPACES, namespace, PODS, pod, METRICS, MEMORY_USAGE);
  const options = _.extend(KubernetesUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Pod CPU Usage Rate
 * GET /cpu/usage_rate
 */
exports.getPodCPUUsageRate = function (cluster, namespace, pod) {
  const URI = util.format('%s%s%s/%s%s/%s%s%s', KubernetesUtils.getUrl(cluster), HEAPSTER, NAMESPACES, namespace, PODS, pod, METRICS, CPU_USAGE_RATE);
  const options = _.extend(KubernetesUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Namespace Network Bytes Received per Second
 * GET /network/rx_rate
 */
exports.getNetworkReceivedRate = function (cluster, namespace) {
  const URI = util.format('%s%s%s/%s%s%s', KubernetesUtils.getUrl(cluster), HEAPSTER, NAMESPACES, namespace, METRICS, NETWORK_RECEIVED_RATE);
  const options = _.extend(KubernetesUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};

/**
 * Namespace Network Bytes Sent per Second
 * GET /network/tx_rate
 */
exports.getNetworkSentRate = function (cluster, namespace) {
  const URI = util.format('%s%s%s/%s%s%s', KubernetesUtils.getUrl(cluster), HEAPSTER, NAMESPACES, namespace, METRICS, NETWORK_SENT_RATE);
  const options = _.extend(KubernetesUtils.getAuth(cluster), { uri: URI });

  return request.get(options);
};
