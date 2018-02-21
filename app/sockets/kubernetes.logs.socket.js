const _ = require('lodash');
const KubernetesService = require('../services/kubernetes.service');

// keep track of opened K8S logs streams
// close them only when no more clients are listening to it
const streams = {};

// to filter out "empty" logs that only contain a timestamp
const timestampRegex = /^((\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\..+Z\s*)$/;
const spacesOnlyRegex = /^\s*$/;

module.exports = function (io, socket) {
  socket.on('KUBERNETES_POD_LOGS_REQUEST', onPodLogsRequest);

  socket.on('error', function (error) {
    console.log('Socket.io Error:', error);
  });

  function onPodLogsRequest (data) {
    const cluster = data.cluster;
    const namespace = data.namespace;
    const pod = data.pod;
    const container = data.container;
    const LOGS_CHANNEL = `KUBERNETES_POD_LOGS_${cluster}_${namespace}_${pod}_${container}`;

    // number of clients in room, before actual one joins
    const LOGS_CHANNEL_CLIENTS = _.get(io.sockets, `adapter.rooms[${LOGS_CHANNEL}].length`, 0);

    // join room LOGS_CHANNEL_<cluster>_<namespace>_<pod>
    socket.join(LOGS_CHANNEL);

    // if it's a new room, create a new K8S stream for it
    if (LOGS_CHANNEL_CLIENTS === 0 && !streams[LOGS_CHANNEL]) {
      streams[LOGS_CHANNEL] = KubernetesService.streamPodLogs(cluster, namespace, pod, container);

      streams[LOGS_CHANNEL].on('data', onData);
      streams[LOGS_CHANNEL].on('error', onError);
      streams[LOGS_CHANNEL].on('end', cleanup);

      socket.on('disconnect', () => {
        // leave room LOGS_CHANNEL_<cluster>_<namespace>_<pod>
        socket.leave(LOGS_CHANNEL);

        // number of clients in room, after actual one leaves
        const LOGS_CHANNEL_CLIENTS_AFTER_LEAVE = _.get(io.sockets, `adapter.rooms[${LOGS_CHANNEL}].length`, 0);

        // if it was the last client listening, clean K8S stream up
        if (LOGS_CHANNEL_CLIENTS_AFTER_LEAVE === 0) {
          cleanup();

          // delete stream objects
          delete streams[LOGS_CHANNEL];
        }
      });
    }

    function onData (chunk) {
      const msg = chunk.toString();

      // filter out empty logs
      // logs look like `2017-09-26T22:31:08.220737045Z MESSAGE OF THE LOG`
      if (msg && !msg.match(timestampRegex) && !msg.match(spacesOnlyRegex)) {
        io.to(LOGS_CHANNEL)
          .emit(LOGS_CHANNEL, msg);
      }
    }

    function onError (error) {
      console.log('An error has occurred (K8S Logs Socket):', error);
      cleanup();
    }

    function cleanup () {
      // remove all event listeners from stream
      streams[LOGS_CHANNEL].removeListener('data', onData);
      streams[LOGS_CHANNEL].removeListener('error', onError);
      streams[LOGS_CHANNEL].removeListener('end', cleanup);
    }
  }
};
