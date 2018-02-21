const _ = require('lodash');
const JSONStream = require('json-stream');
const K8SUtils = require('../utils/kubernetes.utils');
const KubernetesService = require('../services/kubernetes.service');

// keep track of opened K8S pods streams
// close them only when no more clients are listening to it
const streams = {};
const jsonStreams = {};

module.exports = function (io, socket) {
  socket.on('KUBERNETES_NAMESPACE_DEPLOYMENTS_REQUEST', onNamespaceDeploymentsRequest);

  socket.on('error', function (error) {
    console.log('Socket.io Error:', error);
  });

  function onNamespaceDeploymentsRequest (data) {
    const cluster = data.cluster;
    const namespace = data.namespace;
    const deployment = data.deployment;
    const DEPLOYMENTS_CHANNEL = `KUBERNETES_DEPLOYMENT_PODS_${cluster}_${namespace}_${deployment}`;

    // number of clients in room, before actual one joins
    const DEPLOYMENTS_CHANNEL_CLIENTS = _.get(io.sockets, `adapter.rooms[${DEPLOYMENTS_CHANNEL}].length`, 0);

    // join room DEPLOYMENT_PODS_<cluster>_<namespace>_<deployment>
    socket.join(DEPLOYMENTS_CHANNEL);

    // if it's a new room, create a new K8S stream for it
    if (DEPLOYMENTS_CHANNEL_CLIENTS === 0 && !streams[DEPLOYMENTS_CHANNEL]) {
      streams[DEPLOYMENTS_CHANNEL] = KubernetesService.watchNamespacePods(cluster, namespace);
      jsonStreams[DEPLOYMENTS_CHANNEL] = new JSONStream();

      // to convert byte array to json object
      streams[DEPLOYMENTS_CHANNEL].pipe(jsonStreams[DEPLOYMENTS_CHANNEL]);

      jsonStreams[DEPLOYMENTS_CHANNEL].on('data', onData);
      jsonStreams[DEPLOYMENTS_CHANNEL].on('error', onError);
      jsonStreams[DEPLOYMENTS_CHANNEL].on('end', cleanup);

      socket.on('disconnect', () => {
        // leave room DEPLOYMENT_PODS_<cluster>_<namespace>_<deployment>
        socket.leave(DEPLOYMENTS_CHANNEL);

        // number of clients in room, after actual one leaves
        const DEPLOYMENTS_CHANNEL_CLIENTS_AFTER_LEAVE = _.get(io.sockets, `adapter.rooms[${DEPLOYMENTS_CHANNEL}].length`, 0);

        // if it was the last client listening, clean K8S stream up
        if (DEPLOYMENTS_CHANNEL_CLIENTS_AFTER_LEAVE === 0) {
          cleanup();

          // delete streams objects
          delete streams[DEPLOYMENTS_CHANNEL];
          delete jsonStreams[DEPLOYMENTS_CHANNEL];
        }
      });
    }

    function onData (event) {
      const response = {
        type: _.get(event, 'type'),
        data: _.get(event, 'object')
      };

      if (response.type && response.data) {
        // strip secret ENVs from the Pod before emitting
        response.data = K8SUtils.stripPodSecrets(response.data);

        io.to(DEPLOYMENTS_CHANNEL)
          .emit(DEPLOYMENTS_CHANNEL, response);
      }
    }

    function onError (error) {
      console.log('An error has occurred (K8S Deployments Socket):', error);
      cleanup();
    }

    function cleanup () {
      // remove all event listeners from stream and jsonStream
      streams[DEPLOYMENTS_CHANNEL].removeListener('data', onData);
      streams[DEPLOYMENTS_CHANNEL].removeListener('error', onError);
      streams[DEPLOYMENTS_CHANNEL].removeListener('end', cleanup);

      jsonStreams[DEPLOYMENTS_CHANNEL].removeListener('data', onData);
      jsonStreams[DEPLOYMENTS_CHANNEL].removeListener('error', onError);
      jsonStreams[DEPLOYMENTS_CHANNEL].removeListener('end', cleanup);
    }
  }
};
