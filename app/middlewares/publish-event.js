const _ = require('lodash');
const EventsService = require('../services/events.service');

exports.publishEvent = (req, res) => {
  const resEvent = res.locals.event;

  if (resEvent && _.isPlainObject(resEvent)) {
    const event = {
      who: {
        name: _.get(req, 'user.name'),
        username: _.toLower(_.get(req, 'user.username', '')),
        email: _.toLower(_.get(req, 'user.email', ''))
      },
      project: resEvent.project,
      namespace: resEvent.namespace,
      timestamp: new Date().toISOString(),
      where: resEvent.where || 'console',
      source: `${_.toUpper(req.method)} ${req.originalUrl}`,
      what: resEvent.what,
      type: resEvent.type,
      description: `${_.get(req, 'user.name', '')} ${resEvent.type} ${resEvent.what}`
    };

    // if value is specified, append to end of description
    if (resEvent.extra) {
      event.description += ` ${resEvent.extra}`;
    }

    EventsService.publish(event)
      .then(() => {
        console.log('Event published successfully to PubSub', event);
      })
      .catch((response) => {
        console.log('FAILED to publish event to PubSub', event, JSON.stringify(response.error));
      });
  }
};
