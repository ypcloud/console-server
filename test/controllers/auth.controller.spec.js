const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const AuthService = require('../../app/services/auth.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('AuthController', () => {

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

  describe('validate()', () => {
    it('should return unauthorized status', (done) => {
      request(app)
        .get('/auth/validate')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => done())
        .catch(done);
    });

    it('should return values', (done) => {
      request(app)
        .get('/auth/validate')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('getAuthorizationUrl()', () => {
    it('should return 500 status', (done) => {
      const stub = sinon.stub(AuthService, 'getAuthorizationUrl').rejects('error');

      request(app)
        .get('/auth/bitbucket/authorizationUrl?callback=http://callback.com')
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return authorization url', (done) => {
      const stub = sinon.stub(AuthService, 'getAuthorizationUrl').resolves('http://url.com');

      request(app)
        .get('/auth/bitbucket/authorizationUrl?callback=http://callback.com')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('http://url.com');
          expect(stub.getCall(0).args).to.eql(['http://callback.com']);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('loginCallback()', () => {
    it('should return 500 status', (done) => {
      const stub = sinon.stub(AuthService, 'loginCallback').rejects('error');

      request(app)
        .get('/auth/bitbucket/callback')
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return user profile', (done) => {
      const stub = sinon.stub(AuthService, 'loginCallback').resolves('USER PROFILE');

      request(app)
        .get('/auth/bitbucket/callback')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('USER PROFILE');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

});
