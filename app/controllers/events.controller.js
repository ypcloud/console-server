const httpStatus = require('http-status');
const EventsService = require('../services/events.service');

/**
 * Get Events
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getEvents = (req, res, next) => {
  EventsService.getEvents(req.query)
    .then((events) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: events
      });
    })
    .catch(() => next(new Error('Error getting events')));
};
