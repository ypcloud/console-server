const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const NewsService = require('../../app/services/news.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('NewsController', () => {

  let token = null;

  before((done) => {
    loginHelpers.createUser(USER)
      .then(user => loginHelpers.getJWT(user.username))
      .then(jwt => {
        token = jwt;
        done();
      });
  });

  after((done) => {
    loginHelpers.deleteUser(USER.username)
      .then(() => {
        token = null;
        done();
      });
  });

  describe('getNews()', () => {
    const NEWS = require('../fixtures/news.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(NewsService, 'getNews').resolves(NEWS);

      request(app)
        .get('/news')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(NewsService, 'getNews').rejects('error');

      request(app)
        .get('/news')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass param limit=3', (done) => {
      const stub = sinon.stub(NewsService, 'getNews').resolves(NEWS);

      request(app)
        .get('/news?limit=3')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(NEWS);
          expect(stub.getCall(0).args[0]).to.equal(3);
          stub.restore();

          done();
        })
        .catch(done);
    });

    it('should return values, and pass default param limit=0', (done) => {
      const stub = sinon.stub(NewsService, 'getNews').resolves(NEWS);

      request(app)
        .get('/news')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(NEWS);
          expect(stub.getCall(0).args[0]).to.equal(0);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
