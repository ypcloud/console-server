const express = require('express');
const droneCtrl = require('../controllers/drone.controller');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /drone/deployments/total - Get total count of deployments */
router.route('/deployments/total')
  .get(droneCtrl.getDeploymentsCount);

/** GET /drone/builds/:owner/:name - Get list of builds by repo owner/name */
router.route('/builds/:owner/:name')
  .get(droneCtrl.getBuilds);

/** GET /drone/builds/:owner/:name/contributors - Get list of builds by repo owner/name */
router.route('/builds/:owner/:name/contributors')
  .get(droneCtrl.getContributors);

/** GET /drone/builds/:owner/:name/latest - Get latest build by repo owner/name*/
router.route('/builds/:owner/:name/latest')
  .get(droneCtrl.getLatestBuild);

/** GET /drone/builds/:owner/:name/:number - Get build by repo owner/name and number */
router.route('/builds/:owner/:name/:number')
  .get(droneCtrl.getBuild);

/** POST /drone/builds/:owner/:name/:number - Restart build by repo owner/name and number */
router.route('/builds/:owner/:name/:number')
  .post(droneCtrl.restartBuild);

/** POST /drone/builds/:owner/:name/:number/:job - Stop build by repo owner/name and number/job */
router.route('/builds/:owner/:name/:number/:job')
  .delete(droneCtrl.stopBuild);

/** GET /drone/builds/:owner/:name/:number/:job - Get build logs by repo owner/name and number/job */
router.route('/builds/:owner/:name/logs/:number/:job')
  .get(droneCtrl.getBuildLogs);

module.exports = router;
