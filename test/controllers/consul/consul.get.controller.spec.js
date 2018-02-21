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

  describe('get()', () => {
    const VALUES = require('../../fixtures/consul/consul-values.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ConsulService, 'get').resolves(VALUES);

      request(app)
        .get('/consul/kv/values/CLOUD/console-server')
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

    it('should return 401 status', (done) => {
      const stub = sinon.stub(ConsulService, 'get').rejects('error');

      request(app)
        .get('/consul/kv/values/key')
        .set('token', token)
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

    it('should return error if secret key', (done) => {
      const stub = sinon.stub(ConsulService, 'get').resolves(VALUES);

      request(app)
        .get('/consul/kv/values/CLOUD/console-server/.secret-key')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return error if ending with slash', (done) => {
      const stub = sinon.stub(ConsulService, 'get').resolves(VALUES);

      request(app)
        .get('/consul/kv/values/CLOUD/console-server/')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return values', (done) => {
      const stub = sinon.stub(ConsulService, 'get').resolves(VALUES);

      request(app)
        .get('/consul/kv/values/CLOUD/console-server/config.json')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/console-server/config.json']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(VALUES);
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
