const express = require('express');
const projectsCtrl = require('../controllers/projects.controller');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /projects - Get list of projects */
router.route('/')
  .get(projectsCtrl.getProjects);

/** GET /projects/:namespace - Get one project by namespace */
router.route('/:namespace')
  .get(projectsCtrl.getProjectByNamespace);

/** GET /projects/search/:namespace - Get projects by namespace */
router.route('/search/:namespace')
  .get(projectsCtrl.getProjectsByNamespace);

module.exports = router;
