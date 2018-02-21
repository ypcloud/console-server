const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const _ = require('lodash');
const PermissionModel = require('../../app/models/permission.model');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('ProjectsController', () => {

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

  describe('getProjects()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').resolves(['projects']);

      request(app)
        .get('/projects')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').rejects('error');

      request(app)
        .get('/projects')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return projects', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').resolves(['projects']);

      request(app)
        .get('/projects')
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

  describe('getProjectByNamespace()', () => {
    const PROJECT = require('../fixtures/projects.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').resolves(['projects']);

      request(app)
        .get('/projects/ProjectName')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').rejects('error');

      request(app)
        .get('/projects/ProjectName')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return null if project not found', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').resolves(_.cloneDeep(PROJECT));

      request(app)
        .get('/projects/UnknownProjectName')
        .set('token', token)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.result).to.equal(false);
          expect(res.body.data).to.equal(undefined);

          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return project', (done) => {
      const stub = sinon.stub(PermissionModel, 'getUserProjects').resolves(_.cloneDeep(PROJECT));

      request(app)
        .get('/projects/console-server-develop')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data.name).to.equal('CLOUD/console-server');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

});
