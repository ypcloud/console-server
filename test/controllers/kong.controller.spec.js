const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const ProjectModel = require('../../app/models/project.model');
const EventsService = require('../../app/services/events.service');
const KongService = require('../../app/services/kong.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('KongController', () => {

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

  describe('getConsumers()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumers').resolves('consumers');

      request(app)
        .get('/kong/consumers')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumers').rejects('error');

      request(app)
        .get('/kong/consumers')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getConsumers').resolves('consumers');

      request(app)
        .get('/kong/consumers')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('consumers');
          expect(stub.getCall(0).args[0]).to.equal('aws');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getConsumerByUsername()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumerByUsername').resolves('consumer');

      request(app)
        .get('/kong/consumers/console-server')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumerByUsername').rejects('error');

      request(app)
        .get('/kong/consumers/console-server')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getConsumerByUsername').resolves('consumer');

      request(app)
        .get('/kong/consumers/console-server')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('consumer');
          expect(stub.getCall(0).args).to.eql(['aws', 'console-server']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getConsumersByNamespace()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumersByNamespace').resolves('consumer');

      request(app)
        .get('/kong/consumers/namespace/console-server')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumersByNamespace').rejects('error');

      request(app)
        .get('/kong/consumers/namespace/console-server')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getConsumersByNamespace').resolves('consumer');

      request(app)
        .get('/kong/consumers/namespace/console-server')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('consumer');
          expect(stub.getCall(0).args).to.eql(['aws', 'console-server']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('createConsumer()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'createConsumer').resolves('consumer');

      request(app)
        .post('/kong/consumers')
        .send({ username: 'console-server' })
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'createConsumer').rejects('error');

      request(app)
        .post('/kong/consumers')
        .set('token', token)
        .send({ username: 'console-server' })
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const PROJECTS = require('../fixtures/projects.json');
      const CONSUMERS = require('../fixtures/kong/consumers.json');

      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KongService, 'createConsumer').resolves(CONSUMERS.data[0]);

      request(app)
        .post('/kong/consumers')
        .set('token', token)
        .send({ username: 'default@console-server-develop' })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(CONSUMERS.data[0]);
          expect(stub.getCall(0).args).to.eql(['aws', 'default@console-server-develop']);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('POST /kong/consumers');
          expect(eventStub.getCall(0).args[0].namespace).to.eql('console-server-develop');
          expect(eventStub.getCall(0).args[0].what).to.eql('consumer default@console-server-develop');
          expect(eventStub.getCall(0).args[0].type).to.eql('created');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud created consumer default@console-server-develop');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getConsumerPluginConfig()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumerPluginConfig').resolves('consumer');

      request(app)
        .get('/kong/consumers/default@console-server-develop/acls')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getConsumerPluginConfig').rejects('error');

      request(app)
        .get('/kong/consumers/default@console-server-develop/acls')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getConsumerPluginConfig').resolves('consumerPluginConfig');

      request(app)
        .get('/kong/consumers/default%40console-server-develop/acls')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('consumerPluginConfig');
          expect(stub.getCall(0).args).to.eql(['aws', 'default@console-server-develop', 'acls']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('createConsumerPluginConfig()', () => {
    const body = {
      namespace: 'console-server',
      config: {
        username: 'USERNAME',
        password: 'PASSWORD'
      }
    };

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'createConsumerPluginConfig').resolves('consumer');

      request(app)
        .post('/kong/consumers/default@console-server-develop/acls')
        .send(body)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 400 status', (done) => {
      const stub = sinon.stub(KongService, 'createConsumerPluginConfig').rejects('error');

      request(app)
        .post('/kong/consumers/default@console-server-develop/acls')
        .send(body)
        .set('token', token)
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const PROJECTS = require('../fixtures/projects.json');

      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KongService, 'createConsumerPluginConfig').resolves({ id: 'config-id', name: 'acl' });

      request(app)
        .post('/kong/consumers/default@console-server-develop/acls')
        .send(body)
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql({ id: 'config-id', name: 'acl' });
          expect(stub.getCall(0).args).to.eql(['aws', 'default@console-server-develop', 'acls', body.namespace, body.config]);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('POST /kong/consumers/default@console-server-develop/acls');
          expect(eventStub.getCall(0).args[0].namespace).to.eql(body.namespace);
          expect(eventStub.getCall(0).args[0].what).to.eql('acls plugin config for consumer default@console-server-develop');
          expect(eventStub.getCall(0).args[0].type).to.eql('created');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud created acls plugin config for consumer default@console-server-develop');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('deleteConsumerPluginConfig()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'deleteConsumerPluginConfig').resolves('');

      request(app)
        .delete('/kong/consumers/default@console-server-develop/acls/81070613')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'deleteConsumerPluginConfig').rejects('error');

      request(app)
        .delete('/kong/consumers/default@console-server-develop/acls/81070613')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const PROJECTS = require('../fixtures/projects.json');

      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KongService, 'deleteConsumerPluginConfig').resolves('');

      request(app)
        .delete('/kong/consumers/default@console-server-develop/acls/config-id')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('');
          expect(stub.getCall(0).args).to.eql(['aws', 'default@console-server-develop', 'acls', 'config-id']);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /kong/consumers/default@console-server-develop/acls/config-id');
          expect(eventStub.getCall(0).args[0].namespace).to.eql('console-server-develop');
          expect(eventStub.getCall(0).args[0].what).to.eql('acls plugin config for consumer default@console-server-develop');
          expect(eventStub.getCall(0).args[0].type).to.eql('deleted');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud deleted acls plugin config for consumer default@console-server-develop');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('deleteConsumer()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'deleteConsumer').resolves(null);

      request(app)
        .delete('/kong/consumers/console-server')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'deleteConsumer').rejects('error');

      request(app)
        .delete('/kong/consumers/console-server')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'deleteConsumer').resolves(null);

      request(app)
        .delete('/kong/consumers/console-server')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);
          expect(stub.getCall(0).args).to.eql(['aws', 'console-server']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getPlugins()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getPlugins').resolves('plugins');

      request(app)
        .get('/kong/plugins')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getPlugins').rejects('error');

      request(app)
        .get('/kong/plugins')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getPlugins').resolves('plugins');

      request(app)
        .get('/kong/plugins')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('plugins');
          expect(stub.getCall(0).args).to.eql(['aws']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getEnabledPlugins()', () => {
    const enabledPlugins = require('../fixtures/kong/enabled-plugins.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getPlugins').resolves(enabledPlugins);

      request(app)
        .get('/kong/plugins/enabled')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getPlugins').rejects('error');

      request(app)
        .get('/kong/plugins/enabled')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getPlugins').resolves(enabledPlugins);

      // the intersection of activePlugins and Kong's enabled_plugins
      const expectedPlugins = ['acl', 'basic-auth', 'key-auth', 'ldap-auth', 'jwt'];

      request(app)
        .get('/kong/plugins/enabled')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(expectedPlugins);
          expect(stub.getCall(0).args).to.eql(['aws', true]);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getPlugin()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getPlugin').resolves('plugin');

      request(app)
        .get('/kong/plugins/plugin_id')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getPlugin').rejects('error');

      request(app)
        .get('/kong/plugins/plugin_id')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getPlugin').resolves('plugin');

      request(app)
        .get('/kong/plugins/plugin_id')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('plugin');
          expect(stub.getCall(0).args).to.eql(['aws', 'plugin_id']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('addPlugin()', () => {
    const body = {
      name: 'rate-limiting',
      config: {
        minute: 20,
        hour: 500
      }
    };

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'addPlugin').resolves('plugin');

      request(app)
        .post('/kong/apis/console-server/plugins')
        .send(body)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'addPlugin').rejects('error');

      request(app)
        .post('/kong/apis/console-server/plugins')
        .send(body)
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const PROJECTS = require('../fixtures/projects.json');

      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KongService, 'addPlugin').resolves('plugin');

      request(app)
        .post('/kong/apis/console-server/plugins')
        .send(body)
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('plugin');
          expect(stub.getCall(0).args).to.eql(['aws', 'console-server', body.name, body.config]);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('POST /kong/apis/console-server/plugins');
          expect(eventStub.getCall(0).args[0].namespace).to.eql('console-server');
          expect(eventStub.getCall(0).args[0].what).to.eql('plugin rate-limiting');
          expect(eventStub.getCall(0).args[0].type).to.eql('enabled');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud enabled plugin rate-limiting');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('updatePlugin()', () => {
    const body = {
      name: 'rate-limiting',
      id: 'plugin-id',
      config: {
        minute: 20,
        hour: 500
      },
      enabled: true,
    };

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'updatePlugin').resolves('plugin');

      request(app)
        .put('/kong/apis/console-server/plugins')
        .send(body)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'updatePlugin').rejects('error');

      request(app)
        .put('/kong/apis/console-server/plugins')
        .send(body)
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const PROJECTS = require('../fixtures/projects.json');

      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KongService, 'updatePlugin').resolves('plugin');

      request(app)
        .put('/kong/apis/console-server/plugins')
        .send(body)
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('plugin');
          expect(stub.getCall(0).args).to.eql(['aws', 'plugin-id', 'console-server', body.name, body.config, true]);

          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('PUT /kong/apis/console-server/plugins');
          expect(eventStub.getCall(0).args[0].namespace).to.eql('console-server');
          expect(eventStub.getCall(0).args[0].what).to.eql('plugin rate-limiting');
          expect(eventStub.getCall(0).args[0].type).to.eql('updated');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud updated plugin rate-limiting');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getPluginSchema()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getPluginSchema').resolves('schema');

      request(app)
        .get('/kong/plugins/plugin_name/schema')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getPluginSchema').rejects('error');

      request(app)
        .get('/kong/plugins/plugin_name/schema')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getPluginSchema').resolves('schema');

      request(app)
        .get('/kong/plugins/plugin_name/schema')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('schema');
          expect(stub.getCall(0).args).to.eql(['aws', 'plugin_name']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getApis()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getApis').resolves('apis');

      request(app)
        .get('/kong/apis')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getApis').rejects('error');

      request(app)
        .get('/kong/apis')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getApis').resolves('apis');

      request(app)
        .get('/kong/apis')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('apis');
          expect(stub.getCall(0).args).to.eql(['aws']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getApi()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getApi').resolves('api');

      request(app)
        .get('/kong/apis/api_id')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KongService, 'getApi').rejects('error');

      request(app)
        .get('/kong/apis/api_id')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getApi').resolves('api');

      request(app)
        .get('/kong/apis/api_id')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('api');
          expect(stub.getCall(0).args).to.eql(['aws', 'api_id']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getApiPlugins()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KongService, 'getApiPlugins').resolves('plugins');

      request(app)
        .get('/kong/apis/api_id/plugins')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 200 status even if no plugins from KongService', (done) => {
      const stub = sinon.stub(KongService, 'getApiPlugins').rejects('error');

      request(app)
        .get('/kong/apis/api_id/plugins')
        .set('token', token)
        .expect(httpStatus.OK)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(KongService, 'getApiPlugins').resolves('plugins');

      request(app)
        .get('/kong/apis/api_id/plugins')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('plugins');
          expect(stub.getCall(0).args).to.eql(['aws', 'api_id']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
