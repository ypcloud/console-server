const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const ConsulService = require('../../../app/services/consul.service');
const PermissionModel = require('../../../app/models/permission.model');
const PROJECTS = require('../../fixtures/projects.json');
const app = require('../../../server').app;
const loginHelpers = require('../../helpers/login');

const USER = require('../../fixtures/user.json');

describe('ConsulController', () => {

  let token = null;

  before((done) => {
    sinon.stub(PermissionModel, 'getUserProjects').resolves(PROJECTS);

    loginHelpers.createUser(USER)
      .then(user => loginHelpers.getJWT(user.username))
      .then(jwt => {
        token = jwt;
        done();
      });
  });

  after((done) => {
    PermissionModel.getUserProjects.restore();

    loginHelpers.deleteUser(USER.username)
      .then(() => {
        token = null;
        done();
      });
  });

  describe('keys()', () => {
    const KEYS = require('../../fixtures/consul/consul-keys.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ConsulService, 'keys').resolves(KEYS);

      request(app)
        .get('/consul/kv/keys/key')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(ConsulService, 'keys').rejects('error');

      request(app)
        .get('/consul/kv/keys/CLOUD/console-server')
        .set('token', token)
        .expect(httpStatus.NO_CONTENT)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return keys', (done) => {
      const stub = sinon.stub(ConsulService, 'keys').resolves(KEYS);
      const EXPECTED = ['KEY', 'KEY_1', 'KEY_2', 'KEY_3'];

      request(app)
        .get('/consul/kv/keys/CLOUD/console-server')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/console-server']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(EXPECTED);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });
  });

});
