const _ = require('lodash');
const JSONStream = require('json-stream');
const KubernetesService = require('../services/kubernetes.service');

// keep track of opened K8S events streams
// close them only when no more clients are listening to it
const streams = {};
const jsonStreams = {};

module.exports = function (io, socket) {
  socket.on('KUBERNETES_EVENTS_REQUEST', onNamespaceDeploymentsRequest);

  socket.on('error', function (error) {
    console.log('Socket.io Error:', error);
  });

  function onNamespaceDeploymentsRequest (data) {
    const { cluster, namespace } = data;
    const CHANNEL = `KUBERNETES_EVENTS_${cluster}_${namespace}`;

    // join room EVENTS_<cluster>_<namespace>
    socket.join(CHANNEL);

    socket.on('disconnect', () => {
      // leave room EVENTS_<cluster>_<namespace>
      socket.leave(CHANNEL);
    });

    // if it's a new room, create a new K8S stream for it
    if (!streams[cluster]) {
      streams[cluster] = KubernetesService.watchAllEvents(cluster);
      jsonStreams[cluster] = new JSONStream();

      // to convert byte array to json object
      streams[cluster].pipe(jsonStreams[cluster]);

      jsonStreams[cluster].on('data', onData);
      jsonStreams[cluster].on('error', onError);
    }

    function onData (event) {
      const response = {
        type: _.get(event, 'type'),
        data: _.get(event, 'object')
      };

      const EVENT_NAMESPACE = _.get(response.data, 'metadata.namespace');
      const NAMESPACE_CHANNEL = `KUBERNETES_EVENTS_${cluster}_${EVENT_NAMESPACE}`;

      if (response.type && response.data) {
        io.to(NAMESPACE_CHANNEL)
          .emit(NAMESPACE_CHANNEL, response);
      }
    }

    function onError (error) {
      console.log('An error has occurred (K8S Events Socket):', error);
    }
  }
};
