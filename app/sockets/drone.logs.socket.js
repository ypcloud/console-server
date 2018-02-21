const _ = require('lodash');
const DroneService = require('../services/drone.service');

const clientsIds = new Set();

module.exports = function (io, socket) {
  socket.on('DRONE_BUILD_LOGS_REQUEST', onBuildLogsRequest);

  socket.on('error', function (error) {
    console.log('Socket.io Error:', error);
  });

  function onBuildLogsRequest (data) {
    const SOCKET_ID = socket.id;

    // ensure only 1 connection per client
    if (clientsIds.has(SOCKET_ID)) {
      return;
    } else {
      clientsIds.add(SOCKET_ID);
    }

    const owner = data.owner;
    const name = data.name;
    const number = data.number;
    const job = data.job;
    const LOGS_CHANNEL = ['DRONE_BUILD_LOGS', owner, name, number, job].join('_');

    // if it's a new room, create a new K8S stream for it
    const stream = DroneService.streamBuildLogs(owner, name, number, job);

    stream.on('message', onData);
    stream.on('error', onError);
    stream.on('close', cleanup);

    socket.on('disconnect', cleanup);

    function onData (data) {
      const log = JSON.parse(data);
      io.to(SOCKET_ID).emit(LOGS_CHANNEL, log);
    }

    function onError (error) {
      console.log('An error has occurred (Drone Logs Socket):', error);
      cleanup();
    }

    function cleanup () {
      // remove all event listeners from stream
      stream.removeListener('message', onData);
      stream.removeListener('error', onError);
      stream.removeListener('close', cleanup);
    }
  }
};
