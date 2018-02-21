const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const ProjectModel = require('../../app/models/project.model');
const EventsService = require('../../app/services/events.service');
const KubernetesService = require('../../app/services/kubernetes.service');
const KubernetesHeapsterService = require('../../app/services/kubernetes.heapster.service');
const loginHelpers = require('../helpers/login');
const app = require('../../server').app;

const PROJECTS = require('../fixtures/projects.json');
const USER = require('../fixtures/user.json');

describe('KubernetesController', () => {

  let token = null;

  before(() => {
    return loginHelpers.createUser(USER)
      .then(user => loginHelpers.getJWT(user.username))
      .then(jwt => token = jwt);
  });

  after(() => {
    return loginHelpers.deleteUser(USER.username)
      .then(() => token = null);
  });

  describe('getNamespaces()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaces').resolves(['namespaces']);

      request(app)
        .get('/kubernetes/namespaces')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaces').rejects('error');

      request(app)
        .get('/kubernetes/namespaces')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return namespaces', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaces').resolves(['namespaces']);

      request(app)
        .get('/kubernetes/namespaces')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['namespaces']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNodesResources()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNodesResources').resolves(['resources']);

      request(app)
        .get('/kubernetes/resources')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNodesResources').rejects('error');

      request(app)
        .get('/kubernetes/resources')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return resources', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNodesResources').resolves(['resources']);

      request(app)
        .get('/kubernetes/resources')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['resources']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceIngresses()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesHosts').resolves(['ingresses']);

      request(app)
        .get('/kubernetes/namespaces/console/ingresses')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesHosts').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console/ingresses')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return ingresses hosts', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesHosts').resolves(['ingresses']);

      request(app)
        .get('/kubernetes/namespaces/console/ingresses')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['ingresses']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceConfigMaps()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceConfigMaps').resolves('configmaps');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console-server/configmaps')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceConfigMaps').rejects('error');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console-server/configmaps')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return ingresses hosts', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceConfigMaps').resolves('configmaps');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console-server/configmaps')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('configmaps');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceIngressesServiceLabels()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesServiceLabels').resolves(['labels']);

      request(app)
        .get('/kubernetes/namespaces/console/labels')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesServiceLabels').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console/labels')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return ingresses hosts', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesServiceLabels').resolves(['labels']);

      request(app)
        .get('/kubernetes/namespaces/console/labels')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['labels']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceDeployments()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceDeployments').resolves(['deployments']);

      request(app)
        .get('/kubernetes/namespaces/console/deployments')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceDeployments').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console/deployments')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return namespace deployments', (done) => {
      const deployments = require('../fixtures/kubernetes/deployments.json');
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceDeployments')
        .resolves([{
            cluster: 'aws',
            deployments: deployments.items
          }]
        );

      request(app)
        .get('/kubernetes/namespaces/console/deployments')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data[0].cluster).to.equal('aws');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceEvents()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceEvents').resolves(['events']);

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console/events')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceEvents').rejects('error');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console/events')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return namespace events', (done) => {
      const events = require('../fixtures/kubernetes/events.json');
      const stub = sinon.stub(KubernetesService, 'getNamespaceEvents').resolves(events.items);

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console/events?type=Warning')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(events.items);
          expect(stub.getCall(0).args).to.eql(['aws', 'console', 'Warning']);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceKibanaDashboardURL()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceKibanaDashboardURL').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console/kibana-traffic-url')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceKibanaDashboardURL').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console/kibana-traffic-url')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return Kibana URL', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceKibanaDashboardURL').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console/kibana-traffic-url')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('url');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getServiceUrl()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceUrl').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console-server/service-url')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceUrl').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console-server/service-url')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return Kibana URL', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceUrl').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console-server/service-url')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('url');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getServiceUpstreamUrl()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console-server/upstream-url')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console-server/upstream-url')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return Upstream URL', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console-server/upstream-url')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('url');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getServiceHealth()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceHealth').resolves('url');

      request(app)
        .get('/kubernetes/namespaces/console-server/health')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 200 with data null', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceHealth').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console-server/health')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(null);

          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return true', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceHealth').resolves(true);

      request(app)
        .get('/kubernetes/namespaces/console-server/health')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(true);
          stub.restore();

          done();
        })
        .catch(done);
    });

    it('should return true', (done) => {
      const stub = sinon.stub(KubernetesService, 'getServiceHealth').resolves(false);

      request(app)
        .get('/kubernetes/namespaces/console-server/health')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal(false);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceResources()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesHeapsterService, 'getNamespaceResources').resolves(['resources']);

      request(app)
        .get('/kubernetes/namespaces/console/resources')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesHeapsterService, 'getNamespaceResources').rejects('error');

      request(app)
        .get('/kubernetes/namespaces/console/resources')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return resources', (done) => {
      const stub = sinon.stub(KubernetesHeapsterService, 'getNamespaceResources').resolves(['resources']);

      request(app)
        .get('/kubernetes/namespaces/console/resources')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['resources']);
          expect(stub.getCall(0).args).to.eql(['console']);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getPodResources()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesHeapsterService, 'getPodResources').resolves(['resources']);

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console/pods/console-pod/resources')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesHeapsterService, 'getPodResources').rejects('error');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console/pods/console-pod/resources')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return resources', (done) => {
      const stub = sinon.stub(KubernetesHeapsterService, 'getPodResources').resolves(['resources']);

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console/pods/console-pod/resources')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['resources']);
          expect(stub.getCall(0).args).to.eql(['aws', 'console', 'console-pod']);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getDeploymentPods()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getDeploymentPods').resolves(['pods']);

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/pods')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getDeploymentPods').rejects('error');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/pods')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return resources', (done) => {
      const stub = sinon.stub(KubernetesService, 'getDeploymentPods').resolves(['pods']);

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/pods')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['aws', 'namespace', 'deployment']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['pods']);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('patchDeploymentScale()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').rejects('error');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: 5 })
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 400 status if no scale', (done) => {
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: null })
        .set('token', token)
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 400 status if scale is empty string', (done) => {
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: '' })
        .set('token', token)
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 400 status if scale is NaN', (done) => {
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: 'scale' })
        .set('token', token)
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 400 status if scale is > MAXIMUM_DEPLOYMENT_SCALE', (done) => {
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: 6 })
        .set('token', token)
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return scaled deployment if scale is stringed number', (done) => {
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: '5' })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['aws', 'namespace', 'deployment', { spec: { replicas: 5 } }]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('scaled');

          stub.restore();
          eventStub.restore();

          done();
        })
        .catch((error) => {
          stub.restore();
          eventStub.restore();

          done(error);
        });
    });

    it('should return scaled deployment if scale is number', (done) => {
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: 5 })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['aws', 'namespace', 'deployment', { spec: { replicas: 5 } }]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('scaled');

          stub.restore();
          eventStub.restore();

          done();
        })
        .catch((error) => {
          stub.restore();
          eventStub.restore();

          done(error);
        });
    });

    it('should return scaled deployment if scale=`0`', (done) => {
      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/console-server/deployments/deployment-name/scale')
        .send({ scale: '0' })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('PATCH /kubernetes/clusters/aws/namespaces/console-server/deployments/deployment-name/scale');
          expect(eventStub.getCall(0).args[0].namespace).to.eql('console-server');
          expect(eventStub.getCall(0).args[0].what).to.eql('deployment aws.deployment-name');
          expect(eventStub.getCall(0).args[0].type).to.eql('scaled');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud scaled deployment aws.deployment-name to 0');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          expect(stub.getCall(0).args).to.eql(['aws', 'console-server', 'deployment-name', { spec: { replicas: 0 } }]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('scaled');

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch((error) => {
          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done(error);
        });
    });

    it('should return scaled deployment if scale=0', (done) => {
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KubernetesService, 'patchDeploymentScale').resolves('scaled');

      request(app)
        .patch('/kubernetes/clusters/aws/namespaces/namespace/deployments/deployment/scale')
        .send({ scale: 0 })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['aws', 'namespace', 'deployment', { spec: { replicas: 0 } }]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('scaled');

          stub.restore();
          eventStub.restore();

          done();
        })
        .catch((error) => {
          stub.restore();
          eventStub.restore();

          done(error);
        });
    });
  });

  describe('getPodLogs()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getPodLogs').resolves('logs');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console-server/pods/pod-name/logs?container=container-name&previous=true')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'getPodLogs').rejects('error');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console-server/pods/pod-name/logs?container=container-name&previous=true')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should get pod logs', (done) => {
      const stub = sinon.stub(KubernetesService, 'getPodLogs').resolves('logs');

      request(app)
        .get('/kubernetes/clusters/aws/namespaces/console-server/pods/pod-name/logs?container=container-name&previous=true')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['aws', 'console-server', 'pod-name', 'container-name', 'true']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('logs');

          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });
  });

  describe('deletePod()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(KubernetesService, 'deletePod').resolves('pod');

      request(app)
        .delete('/kubernetes/clusters/aws/namespaces/namespace/pods/pod')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(KubernetesService, 'deletePod').rejects('error');

      request(app)
        .delete('/kubernetes/clusters/aws/namespaces/namespace/pods/pod')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should delete pod and publish event', (done) => {
      const projectStub = sinon.stub(ProjectModel, 'findOneByNamespace').resolves(PROJECTS[0]);
      const eventStub = sinon.stub(EventsService, 'publish').resolves('published');
      const stub = sinon.stub(KubernetesService, 'deletePod').resolves('pod');

      request(app)
        .delete('/kubernetes/clusters/aws/namespaces/console-server/pods/pod-name')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(eventStub.called).to.be(true);
          expect(eventStub.getCall(0).args.length).to.eql(1);
          expect(eventStub.getCall(0).args[0].where).to.eql('console');
          expect(eventStub.getCall(0).args[0].source).to.eql('DELETE /kubernetes/clusters/aws/namespaces/console-server/pods/pod-name');
          expect(eventStub.getCall(0).args[0].namespace).to.eql('console-server');
          expect(eventStub.getCall(0).args[0].what).to.eql('pod aws.pod-name');
          expect(eventStub.getCall(0).args[0].type).to.eql('terminated');
          expect(eventStub.getCall(0).args[0].description).to.eql('Mark Massoud terminated pod aws.pod-name');
          expect(eventStub.getCall(0).args[0].who).to.eql({
            name: 'Mark Massoud',
            username: 'markmssd',
            email: 'markmssd@gmail.com'
          });
          expect(eventStub.getCall(0).args[0].project).to.eql({
            owner: 'CLOUD',
            repo: 'console-server'
          });

          expect(stub.getCall(0).args).to.eql(['aws', 'console-server', 'pod-name']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('pod');

          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done();
        })
        .catch((error) => {
          projectStub.restore();
          eventStub.restore();
          stub.restore();

          done(error);
        });
    });
  });

});
