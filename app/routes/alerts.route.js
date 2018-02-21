const express = require('express');
const alertsCtrl = require('../controllers/alerts.controller');

const router = express.Router();

/** GET /alerts - Get alerts from Consul */
router.route('/')
  .get(alertsCtrl.getAlerts);

module.exports = router;
