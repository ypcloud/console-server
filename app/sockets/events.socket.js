const EventsService = require('../services/events.service');

// keep track of opened PubSub events stream
let stream;
const ALL_CHANNEL = 'PUBSUB_EVENTS_ALL';

module.exports = function (io, socket) {
  socket.on('PUBSUB_EVENTS_REQUEST', onEventsRequest);

  socket.on('error', function (error) {
    console.log('Socket.io Error:', error);
  });

  function onEventsRequest (data) {
    const { namespace } = data;
    const CHANNEL = `PUBSUB_EVENTS_${namespace}`;

    // join room PUBSUB_EVENTS_<namespace>
    socket.join(CHANNEL);

    socket.on('disconnect', () => {
      // leave room PUBSUB_EVENTS_<namespace>
      socket.leave(CHANNEL);
    });

    // if it's a new room, create a new PubSub stream for it
    if (!stream) {
      stream = EventsService.watchEvents();

      // to convert byte array to json object
      stream.on('message', onData);
      stream.on('error', onError);
    }

    function onData (event) {
      let data;

      try {
        data = JSON.parse(event.data.toString());

        // emit to ALL channel
        io.to(ALL_CHANNEL)
          .emit(ALL_CHANNEL, data);

        // emit to NAMESPACE channel
        if (data.namespace) {
          const NAMESPACE_CHANNEL = `PUBSUB_EVENTS_${data.namespace}`;

          io.to(NAMESPACE_CHANNEL)
            .emit(NAMESPACE_CHANNEL, data);
        }
      } catch (e) {
        // couldn't parse the event
        console.log('There was an error parsing event data', event);
      }

      // Acknowledge, whether it emitted or not
      event.ack();
    }

    function onError (error) {
      console.log('An error has occurred (PubSub Events Socket):', error);
    }
  }
};
