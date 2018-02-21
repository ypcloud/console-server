const express = require('express');
const sonarCtrl = require('../controllers/sonar.controller');

const router = express.Router();

/** GET /sonar/resources/:owner/:name/:branch - Get project metrics */
router.route('/metrics/:owner/:name/:branch')
  .get(sonarCtrl.getMetrics);

/** GET /sonar/projects - Get list of projects */
router.route('/projects')
  .get(sonarCtrl.getProjects);

module.exports = router;
