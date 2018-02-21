const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const AlertsService = require('../../app/services/alerts.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('AlertsController', () => {

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

  describe('getAlerts()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(AlertsService, 'getAlerts').resolves('Alerts');

      request(app)
        .get('/alerts')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(AlertsService, 'getAlerts').rejects('error');

      request(app)
        .get('/alerts')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(AlertsService, 'getAlerts').resolves('Alerts');

      request(app)
        .get('/alerts')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('Alerts');

          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
