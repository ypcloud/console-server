const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const MetricsService = require('../../app/services/metrics.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('MetricsController', () => {

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

  describe('getLatestMetric()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(MetricsService, 'getLatestMetric').resolves('metrics');

      request(app)
        .get('/metrics/deployments')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(MetricsService, 'getLatestMetric').rejects('error');

      request(app)
        .get('/metrics/deployments')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(MetricsService, 'getLatestMetric').resolves('metrics');

      request(app)
        .get('/metrics/deployments')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('metrics');
          expect(stub.getCall(0).args[0]).to.equal('deployments');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
