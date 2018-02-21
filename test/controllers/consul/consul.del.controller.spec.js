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

  describe('del()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/console-server')
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

    it('should return 401 status if project not found in user\'s projects, with file', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/unknown/project')
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

    it('should return 401 status if project not found in user\'s projects, with folder', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/unknown/project/')
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

    it('should return 401 status if passed the empty key`', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/')
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

    it('should return 500 status if passed secret key', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/console-server/.secret')
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

    it('should return true with PROJECT/', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/dev, as file', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/dev')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/dev']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/dev');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/dev');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/dev');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: undefined
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/dev/, as folder', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/dev/')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/dev/']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/dev/');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/dev/');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/dev/');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'dev'
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/qa, as file', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/qa')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/qa']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/qa');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/qa');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/qa');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: undefined
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/qa/ as folder', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/qa/')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/qa/']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/qa/');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/qa/');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/qa/');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'qa'
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/prod, as file', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/prod')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/prod']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/prod');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/prod');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/prod');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: undefined
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/prod/, as folder', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/prod/config.json')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/prod/config.json']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/prod/config.json');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/prod/config.json');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/prod/config.json');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'prod'
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    // only dev, qa, and prod folders are allowed
    it('should return false with PROJECT/folder/, as folder', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/folder/')
        .set('token', token)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          expect(stub.called).to.be(false);

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/file, as file', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/file')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/file']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/file');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/file');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/file');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: undefined
          });

          stub.restore();
          done();
        })
        .catch((err) => {
          stub.restore();
          done(err);
        });
    });

    it('should return true with PROJECT/REPO', (done) => {
      const stub = sinon.stub(ConsulService, 'del').resolves(true);

      request(app)
        .del('/consul/kv/CLOUD/console-server/')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['CLOUD/console-server/']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /consul/kv/CLOUD/console-server/');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(undefined);
          expect(eventStub.getCall(0).args[0].what).to.eql('config CLOUD/console-server/');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted config CLOUD/console-server/');
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
