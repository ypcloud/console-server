const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const isArrayEqual = require('../helpers/isArrayEqual.helper');
const KubernetesService = require('../../app/services/kubernetes.service');
const NAMESPACES = require('../fixtures/kubernetes/namespaces.json');
const DEPLOYMENTS = require('../fixtures/kubernetes/deployments.json');
const EVENTS = require('../fixtures/kubernetes/events.json');
const NODES = require('../fixtures/kubernetes/nodes.json');

describe('KubernetesService', () => {

  describe('getClusters()', () => {
    it('should return clusters', (done) => {
      const clusters = KubernetesService.getClusters();
      expect(clusters.length).to.equal(2);
      done();
    });
  });

  describe('getNamespacesByCluster()', () => {
    it('should return []', (done) => {
      KubernetesService.getNamespacesByCluster(null)
        .then((namespaces) => {
          expect(namespaces.length).to.equal(0);
          done();
        });
    });

    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getNamespacesByCluster('aws')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return namespaces', (done) => {
      const stub = sinon.stub(request, 'get').resolves(NAMESPACES);

      KubernetesService.getNamespacesByCluster('aws')
        .then((namespaces) => {
          expect(namespaces.length).to.equal(6);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaceEvents()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getNamespaceEvents('aws', 'console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return namespace events', (done) => {
      const stub = sinon.stub(request, 'get').resolves(EVENTS);

      KubernetesService.getNamespaceEvents('aws', 'console-server', 'Warning')
        .then((events) => {
          expect(events.length).to.equal(2);
          expect(events).to.eql(EVENTS.items);
          expect(stub.getCall(0).args[0].qs).to.eql({
            fieldSelector: 'type=Warning'
          });

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getNamespaces()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespacesByCluster').rejects('error');

      KubernetesService.getNamespaces()
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return namespaces', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespacesByCluster').resolves(NAMESPACES.items);

      KubernetesService.getNamespaces('aws')
        .then((namespaces) => {
          expect(namespaces.length).to.equal(6);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getNodesByCluster()', () => {
    it('should return []', (done) => {
      KubernetesService.getNodesByCluster(null)
        .then((nodes) => {
          expect(nodes.length).to.equal(0);
          done();
        });
    });

    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getNodesByCluster('aws')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return nodes and filter by `kubernetes.io/role=node` for AWS cluster', (done) => {
      const stub = sinon.stub(request, 'get').resolves(NODES);

      KubernetesService.getNodesByCluster('aws')
        .then((nodes) => {
          expect(nodes.length).to.equal(3);
          expect(stub.getCall(0).args[0].qs).to.eql({
            labelSelector: 'kubernetes.io/role=node'
          });

          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return nodes and NOT filter by `kubernetes.io/role=node` for GCE cluster', (done) => {
      const stub = sinon.stub(request, 'get').resolves(NODES);

      KubernetesService.getNodesByCluster('gce')
        .then((nodes) => {
          expect(nodes.length).to.equal(3);
          expect(stub.getCall(0).args[0].qs).to.eql(undefined);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getNodesResources()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNodesByCluster').rejects('error');

      KubernetesService.getNodesResources()
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return resources', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNodesByCluster').resolves(NODES.items);

      const expected = [
        {
          cluster: 'aws',
          cpu: 20,
          memory: 82337096
        },
        {
          cluster: 'gce',
          cpu: 20,
          memory: 82337096
        }
      ];

      KubernetesService.getNodesResources()
        .then((resources) => {
          expect(isArrayEqual(resources, expected)).to.equal(true);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getPods()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getPods('aws')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return pods', (done) => {
      const stub = sinon.stub(request, 'get').resolves('pods');

      KubernetesService.getPods('aws')
        .then((pods) => {
          expect(pods).to.equal('pods');
          expect(stub.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/pods');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getNamespacePods()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getNamespacePods('aws', 'console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return namespace pods', (done) => {
      const stub = sinon.stub(request, 'get').resolves('pods');

      KubernetesService.getNamespacePods('aws', 'console-server')
        .then((pods) => {
          expect(pods).to.equal('pods');
          expect(stub.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/namespaces/console-server/pods');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getAllNamespaceIngressesHosts()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get');
      stub.onCall(0).rejects('error');
      stub.onCall(1).rejects('error');

      KubernetesService.getAllNamespaceIngressesHosts('console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return namespace ingresses', (done) => {
      const ingressesAWS = require('../fixtures/kubernetes/ingresses-aws.json');
      const ingressesGCE = require('../fixtures/kubernetes/ingresses-gce.json');

      const stub = sinon.stub(request, 'get');
      stub.onCall(0).resolves(ingressesAWS);
      stub.onCall(1).resolves(ingressesGCE);

      KubernetesService.getAllNamespaceIngressesHosts('console-server')
        .then((ingresses) => {
          const EXPECTED_INGRESSES = [
            'namespaceName-aws.codekube.io',
            'namespaceName-develop-aws.codekube.io',
            'namespaceName-gce.codekube.io',
            'namespaceName-develop-gce.codekube.io'
          ];

          expect(ingresses).to.eql(EXPECTED_INGRESSES);
          expect(stub.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/apis/extensions/v1beta1/namespaces/console-server/ingresses');
          expect(stub.getCall(1).args[0].uri).to.equal('https://kubernetesGceUrl.com/apis/extensions/v1beta1/namespaces/console-server/ingresses');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getDeploymentPods()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getDeploymentPods('aws', 'namespaceName', 'deploymentName')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    // it('should return pods, without -develop ones', (done) => {
    //   const PODS = require('../fixtures/kubernetes/pods.json');
    //   const stub = sinon.stub(require('request-promise'), 'get').resolves(PODS);
    //
    //   KubernetesService.getDeploymentPods('aws', 'namespaceName', 'namespaceName')
    //     .then((pods) => {
    //       expect(pods.length).to.equal(1);
    //
    //       stub.restore();
    //       done();
    //     })
    //     .catch(done);
    // });

    it('should return pods, without non-develop ones', (done) => {
      const PODS = require('../fixtures/kubernetes/pods.json');
      const stub = sinon.stub(request, 'get').resolves(PODS);

      KubernetesService.getDeploymentPods('aws', 'namespaceName-develop', 'namespaceName-develop')
        .then((pods) => {
          expect(pods.length).to.equal(1);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('patchDeploymentScale()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'patch').rejects('error');

      KubernetesService.patchDeploymentScale('aws', 'namespace', 'deployment', { scale: 5 })
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should patch scale', (done) => {
      const stub = sinon.stub(request, 'patch').resolves('scale');

      KubernetesService.patchDeploymentScale('aws', 'namespace', 'deployment', { scale: 5 })
        .then((scale) => {
          expect(scale).to.equal('scale');
          expect(stub.getCall(0).args[0].headers['Content-Type']).to.equal('application/strategic-merge-patch+json');
          expect(stub.getCall(0).args[0].body).to.eql({ scale: 5 });

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getPodLogs()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getPodLogs('aws', 'namespace', 'pod', 'container', false)
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should get pod logs, parse new lines to array, and filter out empty and timestamp-only logs', (done) => {
      const podLogs = require('../fixtures/kubernetes/pod-logs.json');
      const stub = sinon.stub(request, 'get').resolves(podLogs.join(''));

      KubernetesService.getPodLogs('aws', 'namespace', 'pod', 'container', true)
        .then((logs) => {
          const EXPECTED = ['2017-09-26T22:31:08.220737045Z MESSAGE OF LOG 1', '2017-09-26T22:31:08.220737045Z MESSAGE OF LOG 2'];

          expect(logs).to.eql(EXPECTED);
          expect(stub.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/namespaces/namespace/pods/pod/log');
          expect(stub.getCall(0).args[0].qs).to.eql({
            container: 'container',
            previous: true,
            timestamps: true,
            tailLines: 100
          });

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('deletePod()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.deletePod('aws', 'namespace', 'pod')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should delete pod', (done) => {
      const stub = sinon.stub(request, 'delete').resolves('deleted');

      KubernetesService.deletePod('aws', 'namespace', 'pod')
        .then((pod) => {
          expect(pod).to.equal('deleted');
          expect(stub.getCall(0).args[0].headers['Content-Type']).to.equal('application/json');
          expect(stub.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/namespaces/namespace/pods/pod');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getServiceUrl()', () => {
    it('should return error', (done) => {
      const stub = sinon.stub(KubernetesService, 'getAllNamespaceDeployments').rejects('error');

      KubernetesService.getServiceUrl('console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return SoaJS service url', (done) => {
      const soajsDeploymentsByClusters = [
        {
          cluster: 'aws',
          deployments: [DEPLOYMENTS.items[0]],
        }
      ];

      const stub = sinon.stub(KubernetesService, 'getAllNamespaceDeployments').resolves(soajsDeploymentsByClusters);

      KubernetesService.getServiceUrl('console-server')
        .then((url) => {
          expect(url).to.equal('https://prod-api.codekube.io/recosvc4');
          done();
        })
        .catch(done)
        .then(() => stub.restore());
    });

    it('should return service url', (done) => {
      const deploymentsByClusters = [
        {
          cluster: 'aws',
          deployments: [DEPLOYMENTS.items[1]],
        }
      ];

      const deploymentsStub = sinon.stub(KubernetesService, 'getAllNamespaceDeployments').resolves(deploymentsByClusters);
      const ingressesStub = sinon.stub(request, 'get').resolves(require('../fixtures/kubernetes/ingresses-aws.json'));

      KubernetesService.getServiceUrl('console-server')
        .then((url) => {
          expect(url).to.equal('https://namespaceName-aws.codekube.io/servicePath');
          expect(deploymentsStub.getCall(0).args).to.eql(['console-server']);
          expect(ingressesStub.called).to.equal(true);

          done();
        })
        .catch(done)
        .then(() => {
          deploymentsStub.restore();
          ingressesStub.restore();
        });
    });
  });

  describe('getNamespaceConfigMaps()', () => {
    const CONFIG_MAPS = require('../fixtures/kubernetes/configmaps.json');

    it('should return error', (done) => {
      const getStub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getNamespaceConfigMaps('console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          getStub.restore();
          done();
        });
    });

    it('should return configmaps data', (done) => {
      const stub = sinon.stub(request, 'get').resolves(CONFIG_MAPS);

      KubernetesService.getNamespaceConfigMaps('aws', 'console-server')
        .then((configmaps) => {
          expect(stub.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/namespaces/console-server/configmaps');
          expect(configmaps).to.eql(JSON.parse(CONFIG_MAPS.items[0].data['config.json']));

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getServiceUpstreamUrl()', () => {
    const SERVICES = require('../fixtures/kubernetes/services.json');

    it('should return error if getServiceUpstreamUrl fails', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceServices').rejects('error');

      KubernetesService.getServiceUpstreamUrl('console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();

          stub.restore();
          done();
        });
    });

    it('should return upstream url', (done) => {
      const stub = sinon.stub(KubernetesService, 'getNamespaceServices').resolves(SERVICES);

      KubernetesService.getServiceUpstreamUrl('console-server')
        .then((upstreamUrl) => {
          expect(upstreamUrl).to.equal('http://console-server.console-server.svc.cluster.local');
          done();
        })
        .catch(done)
        .then(() => stub.restore());
    });
  });

  describe('getServiceHealth()', () => {
    it('should return error if getServiceUpstreamUrl fails', (done) => {
      const urlStub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').rejects('error');
      const getStub = sinon.stub(request, 'get').resolves('resolving');

      KubernetesService.getServiceHealth('console-server')
        .then(() => expect().fail())
        .catch(error => {
          expect(error).to.be.ok();
          expect(getStub.called).to.equal(false);

          getStub.restore();
          urlStub.restore();

          done();
        });
    });

    it('should return false if health check fails', (done) => {
      const urlStub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').resolves('http://console-server.console-server.svc.cluster.local');
      const getStub = sinon.stub(request, 'get').rejects('error');

      KubernetesService.getServiceHealth('console-server')
        .then((health) => {
          expect(health).to.equal(false);
          expect(getStub.getCall(0).args[0]).to.equal('http://console-server.console-server.svc.cluster.local/health');

          done();
        })
        .catch(done)
        .then(() => {
          urlStub.restore();
          getStub.restore();
        });
    });

    it('should return true if health check succeeds', (done) => {
      const urlStub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').resolves('http://console-server.console-server.svc.cluster.local');
      const getStub = sinon.stub(request, 'get').resolves('resolved with 200');

      KubernetesService.getServiceHealth('console-server')
        .then((health) => {
          expect(health).to.equal(true);
          expect(getStub.getCall(0).args[0]).to.equal('http://console-server.console-server.svc.cluster.local/health');

          done();
        })
        .catch(done)
        .then(() => {
          urlStub.restore();
          getStub.restore();
        });
    });
  });
});
