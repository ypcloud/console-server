const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const SonarService = require('../../app/services/sonar.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('SonarController', () => {

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

  describe('getMetrics()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(SonarService, 'getMetrics').resolves('metrics');

      request(app)
        .get('/sonar/metrics/Owner/Name/develop?metrics=coverage,apdex')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(SonarService, 'getMetrics').rejects('error');

      request(app)
        .get('/sonar/metrics/Owner/Name/develop?metrics=coverage,apdex')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(SonarService, 'getMetrics').resolves('metrics');

      request(app)
        .get('/sonar/metrics/Owner/Name/develop?metrics=coverage,apdex')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name', 'develop', 'coverage,apdex']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.contain('metrics');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getProjects()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(SonarService, 'getProjects').resolves('projects');

      request(app)
        .get('/sonar/projects')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(SonarService, 'getProjects').rejects('error');

      request(app)
        .get('/sonar/projects')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(SonarService, 'getProjects').resolves('projects');

      request(app)
        .get('/sonar/projects')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.contain('projects');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
