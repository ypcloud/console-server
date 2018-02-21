const NewsModel = require('../models/news.model');

exports.getNews = (limit) => {
  return NewsModel.list({ limit });
};
