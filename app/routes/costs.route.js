const express = require('express');
const costsCtrl = require('../controllers/costs.controller');

const router = express.Router();

/** GET / - Get costs */
router.route('/')
  .get(costsCtrl.getCosts);

module.exports = router;
