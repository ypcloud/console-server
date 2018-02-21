const express = require('express');
const elasticSearchCtrl = require('../controllers/elasticsearch.controller');

const router = express.Router();

/** GET /elasticsearch/search/:namespace - Search logs by namespace */
router.route('/search/:namespace')
  .get(elasticSearchCtrl.searchByNamespace);

/** GET /elasticsearch/api-catalog/:environment?searchTerms=console-server,uptime,getDowntimes - Search API Catalog */
router.route('/api-catalog/:environment')
  .get(elasticSearchCtrl.searchAPICatalog);

/** GET /elasticsearch/api-catalog/:environment/service-groups - Get all unique serviceGroups and their count */
router.route('/api-catalog/:environment/service-groups')
  .get(elasticSearchCtrl.getServiceGroups);

module.exports = router;
