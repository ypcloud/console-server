const express = require('express');
const newsCtrl = require('../controllers/news.controller');

const router = express.Router();

/** GET /news - Get news from AWS S3*/
router.route('/')
  .get(newsCtrl.getNews);

module.exports = router;
