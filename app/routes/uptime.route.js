const express = require('express');
const uptimeCtrl = require('../controllers/uptime.controller');

const router = express.Router();

/** GET /sla - Get SLA */
router.route('/sla')
  .get(uptimeCtrl.getSLA);

/** GET /uptimes - Get daily|weekly|monthly Uptime */
router.route('/uptimes')
  .get(uptimeCtrl.getUptimes);

/** GET /downtimes - Get Downtimes */
router.route('/downtimes')
  .get(uptimeCtrl.getDowntimes);

/** GET /infras - Get Infras */
router.route('/infras')
  .get(uptimeCtrl.getInfras);

/** GET /infras/uptimes - Get Infras Uptimes */
router.route('/infras/uptimes')
  .get(uptimeCtrl.getInfrasUptimes);

module.exports = router;
