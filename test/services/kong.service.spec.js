const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const KongService = require('../../app/services/kong.service');
const KubernetesService = require('../../app/services/kubernetes.service');
const request = require('request-promise');

describe('Kong Service tests', () => {
  let requestGet;
  let requestPut;
  let requestPost;
  let requestDelete;

  // const expectedAuth = {
  //   aws: {
  //     bearer: 'KONG_TOKEN_AWS'
  //   },
  //   gce: {
  //     bearer: 'KONG_TOKEN_GCE'
  //   }
  // };

  beforeEach(() => {
    requestGet = sinon.stub(request, 'get').resolves({});
    requestPut = sinon.stub(request, 'put').resolves({});
    requestPost = sinon.stub(request, 'post').resolves({});
    requestDelete = sinon.stub(request, 'delete').resolves({});
  });

  afterEach(() => {
    request.get.restore();
    request.put.restore();
    request.post.restore();
    request.delete.restore();
  });

  describe('getConsumers', () => {
    it('should call correct endpoint for AWS', (done) => {
      KongService.getConsumers('aws')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      KongService.getConsumers('gce')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/consumers');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });
  });

  describe('getConsumerByUsername', () => {
    it('should call correct endpoint for AWS', (done) => {
      KongService.getConsumerByUsername('aws', 'console-server')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers/console-server');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      KongService.getConsumerByUsername('gce', 'console-server')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/consumers/console-server');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });
  });

  describe('getConsumersByNamespace', () => {
    it('should return no consumers', (done) => {
      const consumers = require('../fixtures/kong/consumers.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(consumers);

      KongService.getConsumersByNamespace('aws', null)
        .then(consumersList => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers');
          expect(consumersList.data.length).to.equal(0);

          done();
        })
        .catch(done);
    });

    it('should return 1 consumer, since a `console-develop` has no valid custom_id', (done) => {
      const consumers = require('../fixtures/kong/consumers.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(consumers);

      KongService.getConsumersByNamespace('gce', 'console-develop')
        .then(consumersList => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/consumers');
          expect(consumersList.data).to.eql([consumers.data[1]]);

          done();
        })
        .catch(done);
    });

    it('should return 2 consumers', (done) => {
      const consumers = require('../fixtures/kong/consumers.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(consumers);

      KongService.getConsumersByNamespace('gce', 'console-server-develop')
        .then(consumersList => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/consumers');
          expect(consumersList.data).to.eql([consumers.data[0]]);

          done();
        })
        .catch(done);
    });
  });

  describe('createConsumer', () => {
    it('should call correct endpoint for AWS', (done) => {
      KongService.createConsumer('aws', 'console-server')
        .then(() => {
          expect(requestPost.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers');
          // expect(requestPost.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestPost.getCall(0).args[0].body).to.eql({
            username: 'console-server'
          });
          expect(requestPost.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      KongService.createConsumer('gce', 'console-server')
        .then(() => {
          expect(requestPost.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/consumers');
          // expect(requestPost.getCall(0).args[0].auth).to.eql(expectedAuth.gce);
          expect(requestPost.getCall(0).args[0].body).to.eql({
            username: 'console-server'
          });
          expect(requestPost.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('getConsumerPluginConfig', () => {
    it('should fail if no username', (done) => {
      KongService.getConsumerPluginConfig('aws', null, 'acls')
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Username is required');
          done();
        });
    });

    it('should fail if no pluginName', (done) => {
      KongService.getConsumerPluginConfig('aws', 'default@console-server', null)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin name is required');
          done();
        });
    });

    it('should call correct endpoint for AWS', (done) => {
      KongService.getConsumerPluginConfig('aws', 'default@console-server', 'acls')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers/default@console-server/acls');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestGet.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('createConsumerPluginConfig', () => {
    const labels = {
      'codekube.io/service.group': 'cloud',
      'codekube.io/service.env': 'dev',
    };

    let labelsStub;

    beforeEach(() => {
      labelsStub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesServiceLabels').resolves(labels);
    });

    afterEach(() => {
      KubernetesService.getAllNamespaceIngressesServiceLabels.restore();
    });

    it('should fail if no username', (done) => {
      KongService.createConsumerPluginConfig('aws', null, 'acls', 'console-server', {})
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Username is required');
          done();
        });
    });

    it('should fail if no pluginName', (done) => {
      KongService.createConsumerPluginConfig('aws', 'default@console-server', null, 'console-server', {})
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin name is required');
          done();
        });
    });

    it('should fail if no namespace', (done) => {
      KongService.createConsumerPluginConfig('aws', 'default@console-server', 'acls', null, {})
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Namespace is required');
          done();
        });
    });

    it('should call correct endpoint for AWS, and trim spaces from group', (done) => {
      KongService.createConsumerPluginConfig('aws', 'default@console-server', 'acls', 'console-server', { group: '  group with spaces  ' })
        .then(() => {
          expect(labelsStub.getCall(0).args).to.eql(['console-server']);
          expect(requestPost.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers/default@console-server/acls');
          // expect(requestPost.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestPost.getCall(0).args[0].json).to.equal(true);
          expect(requestPost.getCall(0).args[0].body.group).to.equal('groupwithspaces@cloud.dev');

          done();
        })
        .catch(done);
    });

    it('should append @serviceGroup.serviceEnv to group', (done) => {
      KongService.createConsumerPluginConfig('aws', 'default@console-server', 'acls', 'console-server', { group: 'default.consoleServer' })
        .then(() => {
          expect(labelsStub.getCall(0).args).to.eql(['console-server']);
          expect(requestPost.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers/default@console-server/acls');
          // expect(requestPost.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestPost.getCall(0).args[0].json).to.equal(true);
          expect(requestPost.getCall(0).args[0].body.group).to.equal('default.consoleServer@cloud.dev');

          done();
        })
        .catch(done);
    });
  });

  describe('deleteConsumerPluginConfig', () => {
    it('should fail if no username', (done) => {
      KongService.deleteConsumerPluginConfig('aws', null, 'acls', 'config-id')
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Username is required');
          done();
        });
    });

    it('should fail if no pluginName', (done) => {
      KongService.deleteConsumerPluginConfig('aws', 'default@console-server', null, 'config-id')
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin name is required');
          done();
        });
    });

    it('should fail if no configId', (done) => {
      KongService.deleteConsumerPluginConfig('aws', 'default@console-server', 'acls', null)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Config id is required');
          done();
        });
    });

    it('should call correct endpoint for AWS', (done) => {
      KongService.deleteConsumerPluginConfig('aws', 'default@console-server', 'acls', 'config-id')
        .then(() => {
          expect(requestDelete.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers/default@console-server/acls/config-id');
          // expect(requestDelete.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestDelete.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('deleteConsumer', () => {
    it('should call correct endpoint for AWS', (done) => {
      KongService.deleteConsumer('aws', 'console-server')
        .then(() => {
          expect(requestDelete.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/consumers/console-server');
          // expect(requestDelete.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      KongService.deleteConsumer('gce', 'console-server')
        .then(() => {
          expect(requestDelete.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/consumers/console-server');
          // expect(requestDelete.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });
  });

  describe('getPlugins', () => {
    it('should call correct endpoint for AWS', (done) => {
      KongService.getPlugins('aws')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/plugins');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      KongService.getPlugins('gce')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/plugins');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for AWS, `enabledOnly` as randomString', (done) => {
      KongService.getPlugins('gce', 'random')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/plugins');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for AWS, `enabledOnly` as true', (done) => {
      KongService.getPlugins('gce', true)
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/plugins/enabled');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });
  });

  describe('getPlugin', () => {
    it('should call correct endpoint for AWS', (done) => {
      KongService.getPlugin('aws', 'plugin_id')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/plugins/plugin_id');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      KongService.getPlugin('gce', 'plugin_id')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/plugins/plugin_id');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

          done();
        })
        .catch(done);
    });
  });

  describe('addPlugin', () => {
    const config = {
      minute: 20,
      hour: 500
    };

    it('should fail if no namespace', (done) => {
      KongService.addPlugin('aws', null, 'name', config)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Namespace is required');
          done();
        });
    });

    it('should fail if no plugin name', (done) => {
      KongService.addPlugin('aws', 'console-server-develop', null, config)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin name is required');
          done();
        });
    });

    it('should fail if no plugin config', (done) => {
      KongService.addPlugin('aws', 'console-server-develop', 'name', null)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin config is required');
          done();
        });
    });

    it('should call correct endpoint for AWS, with null values', (done) => {
      const awsIngresses = require('../fixtures/kubernetes/ingresses-aws.json');
      const gceIngresses = require('../fixtures/kubernetes/ingresses-gce.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get');

      requestGet.onCall(0).resolves(awsIngresses); // aws call
      requestGet.onCall(1).resolves(gceIngresses); // gce call

      KongService.addPlugin('aws', 'console-server-develop', 'name', config)
        .then(() => {
          // requestGet
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');
          expect(requestGet.getCall(1).args[0].uri).to.equal('https://kubernetesGceUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');

          // requestPost
          expect(requestPost.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/apis/serviceName.g1.v1.console-server-develop.api.ypcgw/plugins');
          // expect(requestPost.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestPost.getCall(0).args[0].body).to.eql({
            name: 'name',
            config: config
          });
          expect(requestPost.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('updatePlugin', () => {
    const config = {
      minute: 20,
      hour: 500
    };

    it('should fail if no namespace', (done) => {
      KongService.updatePlugin('aws', 'pluginId', null, 'name', config, true)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Namespace is required');
          done();
        });
    });

    it('should fail if no plugin id', (done) => {
      KongService.updatePlugin('aws', null, 'console-server-develop', 'name', config, true)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin id is required');
          done();
        });
    });

    it('should fail if no plugin name', (done) => {
      KongService.updatePlugin('aws', 'pluginId', 'console-server-develop', null, config, true)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin name is required');
          done();
        });
    });

    it('should fail if no plugin config', (done) => {
      KongService.updatePlugin('aws', 'pluginId', 'console-server-develop', 'name', null, true)
        .then(done.fail)
        .catch(error => {
          expect(error).to.equal('Plugin config is required');
          done();
        });
    });

    it('should call correct endpoint for AWS, with null values', (done) => {
      const awsIngresses = require('../fixtures/kubernetes/ingresses-aws.json');
      const gceIngresses = require('../fixtures/kubernetes/ingresses-gce.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get');

      requestGet.onCall(0).resolves(awsIngresses); // aws call
      requestGet.onCall(1).resolves(gceIngresses); // gce call

      KongService.updatePlugin('aws', 'pluginId', 'console-server-develop', 'name', config, true)
        .then(() => {
          // requestGet
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');
          expect(requestGet.getCall(1).args[0].uri).to.equal('https://kubernetesGceUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');

          // requestPut
          expect(requestPut.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/apis/serviceName.g1.v1.console-server-develop.api.ypcgw/plugins');
          // expect(requestPost.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(requestPut.getCall(0).args[0].body['id']).to.equal('pluginId');
          expect(requestPut.getCall(0).args[0].body['name']).to.equal('name');
          expect(requestPut.getCall(0).args[0].body['config']).to.eql(config);
          expect(requestPut.getCall(0).args[0].body['enabled']).to.equal(true);
          expect(requestPut.getCall(0).args[0].body['created_at']).not.to.be(undefined);
          expect(requestPut.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('getPluginSchema', () => {
    it('should call correct endpoint for AWS, and not merge plugin descriptions if not found', (done) => {
      KongService.getPluginSchema('aws', 'plugin_name')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/plugins/schema/plugin_name');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE, and merge plugin descriptions if found', (done) => {
      const aclSchema = require('../fixtures/kong/schema-acl.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(aclSchema);

      KongService.getPluginSchema('gce', 'acl')
        .then(schema => {
          const EXPECTED = {
            description: 'Restrict access to an API by whitelisting or blacklisting consumers using arbitrary ACL group names. This plugin requires an authentication plugin (basic-auth, key-auth, etc) to have been already enabled on the API.',
            no_consumer: true,
            fields: {
              blacklist: {
                type: 'array',
                description: 'Comma separated list of arbitrary group names that are not allowed to consume the API. One of <code>whitelist</code> or <code>blacklist</code> must be specified.'
              },
              whitelist: {
                type: 'array',
                description: 'Comma separated list of arbitrary group names that are allowed to consume the API. One of <code>whitelist</code> or <code>blacklist</code> must be specified.'
              }
            },
            self_check: 'function'
          };

          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/plugins/schema/acl');
          expect(schema).to.eql(EXPECTED);
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });
  });

  describe('getApiPlugins', () => {
    it('should call correct endpoint for AWS', (done) => {
      const awsIngresses = require('../fixtures/kubernetes/ingresses-aws.json');
      const gceIngresses = require('../fixtures/kubernetes/ingresses-gce.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get');

      requestGet.onCall(0).resolves(awsIngresses); // aws call
      requestGet.onCall(1).resolves(gceIngresses); // gce call
      requestGet.onCall(2).resolves('plugins'); // kong call

      KongService.getApiPlugins('aws', 'console-server-develop')
        .then(plugins => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');
          expect(requestGet.getCall(1).args[0].uri).to.equal('https://kubernetesGceUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');
          expect(requestGet.getCall(2).args[0].uri).to.equal('https://kongAwsUrl.com/apis/serviceName.g1.v1.console-server-develop.api.ypcgw/plugins');
          expect(plugins).to.equal('plugins');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });
  });

  describe('getApis', () => {
    it('should call correct endpoint for AWS', (done) => {
      const apis = require('../fixtures/kong/apis.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(apis);

      KongService.getApis('aws')
        .then(apisList => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongAwsUrl.com/apis');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
          expect(apisList.data).to.eql([apis.data[0], apis.data[1]]);

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for GCE', (done) => {
      const apis = require('../fixtures/kong/apis.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(apis);

      KongService.getApis('gce')
        .then(apisList => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kongGceUrl.com/apis');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);
          expect(apisList.data).to.eql([apis.data[0], apis.data[1]]);

          done();
        })
        .catch(done);
    });
  });

  describe('getApi', () => {
    it('should call correct endpoint for AWS', (done) => {
      const awsIngresses = require('../fixtures/kubernetes/ingresses-aws.json');
      const gceIngresses = require('../fixtures/kubernetes/ingresses-gce.json');

      request.get.restore();
      requestGet = sinon.stub(request, 'get');

      requestGet.onCall(0).resolves(awsIngresses); // aws call
      requestGet.onCall(1).resolves(gceIngresses); // gce call
      requestGet.onCall(2).resolves('api'); // kong call

      KongService.getApi('aws', 'console-server-develop')
        .then(api => {
          expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');
          expect(requestGet.getCall(1).args[0].uri).to.equal('https://kubernetesGceUrl.com/apis/extensions/v1beta1/namespaces/console-server-develop/ingresses');
          expect(requestGet.getCall(2).args[0].uri).to.equal('https://kongAwsUrl.com/apis/serviceName.g1.v1.console-server-develop.api.ypcgw');
          expect(api).to.equal('api');
          // expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

          done();
        })
        .catch(done);
    });
  });
});
