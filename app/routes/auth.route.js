const express = require('express');
const authCtrl = require('../controllers/auth.controller');
const isUserGuard = require('../policies/isUser').isUser;

const router = express.Router();

router.route('/bitbucket/authorizationUrl')
  .get(authCtrl.getAuthorizationUrl);

router.route('/bitbucket/callback')
  .get(authCtrl.loginCallback);

router.route('/validate')
  .get(isUserGuard, authCtrl.validate);

module.exports = router;
