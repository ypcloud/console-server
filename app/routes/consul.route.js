const express = require('express');
const consulCtrl = require('../controllers/consul.controller');
const isConsulKeyAllowedGuard = require('../policies/isConsulKeyAllowed').isConsulKeyAllowed;
const parseConsulKey = require('../middlewares/parse-consul-key').parseConsulKey;
const publishEvent = require('../middlewares/publish-event').publishEvent;

const router = express.Router();

/** GET /consul/kv/keys/:key - Get keys only */
router.route('/kv/keys/*')
  .get(parseConsulKey, isConsulKeyAllowedGuard, consulCtrl.keys);

/** GET /consul/kv/values/:key - Get key */
router.route('/kv/values/*')
  .get(parseConsulKey, isConsulKeyAllowedGuard, consulCtrl.get);

/** PUT /consul/kv - Set key and its value */
router.route('/kv/*')
  .put(parseConsulKey, isConsulKeyAllowedGuard, consulCtrl.set, publishEvent);

/** DEL /consul/kv - Delete a key and its value */
router.route('/kv/*')
  .delete(parseConsulKey, isConsulKeyAllowedGuard, consulCtrl.del, publishEvent);

module.exports = router;
