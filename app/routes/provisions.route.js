const express = require('express');
const provisionsCtrl = require('../controllers/provisions.controller');

const router = express.Router();

/** GET /dns - Check DNS Availability */
router.route('/dns')
  .get(provisionsCtrl.checkDNS);

/** POST /provisions/:owner/:repo - Init New Project */
router.route('/:owner/:repo')
  .post(provisionsCtrl.initNewProject);

/** POST /provisions/:owner/:repo/:service - Create Service Provisioning */
router.route('/:owner/:repo/:service')
  .post(provisionsCtrl.provisionService);

module.exports = router;
