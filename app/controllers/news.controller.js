const httpStatus = require('http-status');
const NewsService = require('../services/news.service');

/**
 * Get News
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getNews = (req, res, next) => {
  const limit = req.query.limit || 0;

  NewsService.getNews(+limit)
    .then((news) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: news
      });
    })
    .catch(() => next(new Error('Error getting news')));
};
