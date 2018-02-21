const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const NewsService = require('../../app/services/news.service');

describe('News Service tests', function () {

  beforeEach(function () {
  });

  afterEach(function () {
  });

  describe('getNews()', function () {
    it('should call correct endpoint for getNews', function (done) {
      NewsService.getNews()
        .then(function () {
          // TODO: test that correct number of news is returned, based on passed `limit`
          done();
        })
        .catch(done);
    });
  });

});
