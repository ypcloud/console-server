const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const EventsService = require('../../../app/services/events.service');
const ConsulService = require('../../../app/services/consul.service');
const PermissionModel = require('../../../app/models/permission.model');
const PROJECTS = require('../../fixtures/projects.json');
const app = require('../../../server').app;
const loginHelpers = require('../../helpers/login');

const USER = require('../../fixtures/user.json');

describe('ConsulController', () => {

  let token = null;
  let eventStub = null;

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

  beforeEach(() => {
    eventStub = sinon.stub(EventsService, 'publish').resolves('published');
  });

  afterEach(() => {
    EventsService.publish.restore();
  });

  describe('set()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ConsulService, 'set').resolves(true);

      request(app)
        .put('/consul/kv/CLOUD/console-server')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          expect(eventStub.called).to.be(false);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return 401 status', (done) => {
      const stub = sinon.stub(ConsulService, 'set').rejects('error');

      request(app)
        .put('/consul/kv/CLOUD/console-server')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          expect(eventStub.called).to.be(false);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return 401 status if passed the empty key`', (done) => {
      const stub = sinon.stub(ConsulService, 'set').resolves(true);

      request(app)
        .put('/consul/kv/')
        .set('token', token)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          expect(eventStub.called).to.be(false);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return 500 status if passed secret key', (done) => {
      const stub = sinon.stub(ConsulService, 'set').resolves(true);

      request(app)
        .put('/consul/kv/CLOUD/console-server/.secret')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          expect(eventStub.called).to.be(false);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should set value to null if passed a folder key/, and publish event', (done) => {
      const stub = sinon.stub(ConsulService, 'set').resolves(true);

      request(app)
        .put('/consul/kv/CLOUD/console-server/')
        .send({ config: 'Value!' })
        .set('token', token)
        .expect(httpStatus.OK)
        .then(() => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/console-server/', null]);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('PUT /consul/kv/CLOUD/console-server/');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/console-server/');
          expect(eventStub.getCall(0).args[0].type).to.eql('updated');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud updated config CLOUD/console-server/');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true', (done) => {
      const stub = sinon.stub(ConsulService, 'set').resolves(true);

      request(app)
        .put('/consul/kv/CLOUD/console-server/config.json')
        .send({ config: 'Value!' })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/console-server/config.json', 'Value!']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('PUT /consul/kv/CLOUD/console-server/config.json');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/console-server/config.json');
          expect(eventStub.getCall(0).args[0].type).to.eql('updated');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud updated config CLOUD/console-server/config.json');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

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
