const express = require('express');
const eventsCtrl = require('../controllers/events.controller');

const router = express.Router();

/** GET /events - Get events */
router.route('/')
  .get(eventsCtrl.getEvents);

module.exports = router;
