const express = require('express');
const isUserCronJobAllowed = require('../policies/isUserCronJobAllowed').isConsulKeyAllowed;
const sitespeedCtrl = require('../controllers/sitespeed.controller');

const router = express.Router();

/** GET /sitespeed/cronjobs - Get sitespeed cronjobs */
router.route('/cronjobs')
  .get(sitespeedCtrl.listCronJobs);

/** GET /sitespeed/cronjobs/:name/reports - Get sitespeed cronjob reports from S3 */
router.route('/cronjobs/:name/reports')
  .get(sitespeedCtrl.getCronJobS3Reports);

/** POST /sitespeed/cronjobs - Create sitespeed cronjob */
router.route('/cronjobs')
  .post(sitespeedCtrl.createCronJob);

/** PUT /sitespeed/cronjobs/:name - Update sitespeed cronjob */
router.route('/cronjobs/:name')
  .put(isUserCronJobAllowed, sitespeedCtrl.updateCronJob);

/** DELETE /sitespeed/cronjobs/:name - Delete sitespeed cronjob */
router.route('/cronjobs/:name')
  .delete(isUserCronJobAllowed, sitespeedCtrl.deleteCronJob);

module.exports = router;
