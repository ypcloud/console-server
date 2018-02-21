const express = require('express');
const kongCtrl = require('../controllers/kong.controller');
const eventPublisher = require('../middlewares/publish-event').publishEvent;

const router = express.Router();

router.route('/consumers')
  .get(kongCtrl.getConsumers);

router.route('/consumers/:username')
  .get(kongCtrl.getConsumerByUsername);

router.route('/consumers/namespace/:namespace')
  .get(kongCtrl.getConsumersByNamespace);

router.route('/consumers/:username/:pluginName')
  .get(kongCtrl.getConsumerPluginConfig);

router.route('/consumers/:username/:pluginName')
  .post(kongCtrl.createConsumerPluginConfig, eventPublisher);

router.route('/consumers/:username/:pluginName/:configId')
  .delete(kongCtrl.deleteConsumerPluginConfig, eventPublisher);

router.route('/consumers')
  .post(kongCtrl.createConsumer, eventPublisher);

router.route('/consumers/:username')
  .delete(kongCtrl.deleteConsumer);

router.route('/plugins')
  .get(kongCtrl.getPlugins);

router.route('/plugins/enabled')
  .get(kongCtrl.getEnabledPlugins);

// this route is mostly to get missing plugins docs,
// so it's easier to keep them up to date
router.route('/plugins/check-docs')
  .get(kongCtrl.checkPluginsDocs);

router.route('/plugins/:id')
  .get(kongCtrl.getPlugin);

router.route('/plugins/:name/schema')
  .get(kongCtrl.getPluginSchema);

router.route('/apis')
  .get(kongCtrl.getApis);

router.route('/apis/:id')
  .get(kongCtrl.getApi);

router.route('/apis/:id/plugins')
  .get(kongCtrl.getApiPlugins);

router.route('/apis/:id/plugins')
  .post(kongCtrl.addPlugin, eventPublisher);

router.route('/apis/:id/plugins')
  .put(kongCtrl.updatePlugin, eventPublisher);

module.exports = router;
