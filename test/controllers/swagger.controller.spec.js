const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const SwaggerService = require('../../app/services/swagger.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('SwaggerController', () => {

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

  describe('getSwaggerFile()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(SwaggerService, 'getSwaggerFile').resolves('file');

      request(app)
        .get('/swagger/console-server')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(SwaggerService, 'getSwaggerFile').rejects('error');

      request(app)
        .get('/swagger/console-server')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(SwaggerService, 'getSwaggerFile').resolves('file');

      request(app)
        .get('/swagger/console-server')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('file');
          expect(stub.getCall(0).args).to.eql(['console-server']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
