const _ = require('lodash');
const DroneService = require('../services/drone.service');

// keep only one connection to Drone Feed
let feedStream;

module.exports = function (io, socket) {
  socket.on('DRONE_BUILD_FEED_REQUEST', onFeedRequest);

  function onFeedRequest (data) {
    const { owner, name, number } = data;

    const DRONE_BUILD_CHANNEL = `DRONE_BUILD_FEED_${owner}_${name}_${number}`;
    socket.join(DRONE_BUILD_CHANNEL);

    socket.on('disconnect', () => {
      socket.leave(DRONE_BUILD_CHANNEL);
    });
  }

  // on connection, init our Drone feed stream, if not yet
  if (!feedStream) {
    feedStream = DroneService.streamFeed();

    feedStream.on('message', onData);
    feedStream.on('error', onError);
  }

  socket.on('error', function (error) {
    console.log('Socket.io Error:', error);
  });

  function onData (event) {
    event = JSON.parse(event);
    const { repo, build } = event;

    const LOGS_CHANNEL = `DRONE_BUILD_FEED_${repo.owner}_${repo.name}_${build.number}`;

    io.to(LOGS_CHANNEL)
      .emit(LOGS_CHANNEL, build);
  }

  function onError (error) {
    console.log('An error has occurred (Drone Feed Socket):', error);
  }
};
