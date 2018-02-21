const express = require('express');
const metricsCtrl = require('../controllers/metrics.controller');

const router = express.Router();

/** GET /metrics/:type - Get latest metric of a given type */
router.route('/:type')
  .get(metricsCtrl.getLatestMetric);

module.exports = router;
