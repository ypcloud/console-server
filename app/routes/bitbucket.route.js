const express = require('express');
const bitbucketCtrl = require('../controllers/bitbucket.controller');

const router = express.Router();

router.route('/projects')
  .get(bitbucketCtrl.getProjects);

router.route('/projects/:project/repos')
  .get(bitbucketCtrl.getProjectRepositories);

module.exports = router;
