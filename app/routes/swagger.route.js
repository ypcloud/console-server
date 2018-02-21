const express = require('express');
const swaggerCtrl = require('../controllers/swagger.controller');

const router = express.Router();

/** GET /swagger/:namespace - Get Swagger file from a service's /swagger endpoint */
router.route('/:namespace')
  .get(swaggerCtrl.getSwaggerFile);

module.exports = router;
