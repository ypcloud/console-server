const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const SwaggerService = require('../../app/services/swagger.service');
const KongService = require('../../app/services/kong.service');
const KubernetesService = require('../../app/services/kubernetes.service');

describe('Swagger Service tests', () => {
  let requestGet;
  let getApiPluginsStub;
  let getServiceUrlStub;
  let getServiceUpstreamUrlStub;

  beforeEach(() => {
    requestGet = sinon.stub(request, 'get').resolves({});
    getApiPluginsStub = sinon.stub(KongService, 'getApiPlugins').resolves(require('../fixtures/kong/api-plugins.json'));
    getServiceUrlStub = sinon.stub(KubernetesService, 'getServiceUrl').resolves('http://user:pass@host.com:8080/p/a/t/h?query=string#hash');
    getServiceUpstreamUrlStub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').resolves('https://upstreamUrl.svc.cluster.local');
  });

  afterEach(() => {
    request.get.restore();
    KongService.getApiPlugins.restore();
    KubernetesService.getServiceUrl.restore();
    KubernetesService.getServiceUpstreamUrl.restore();
  });

  describe('getSwaggerFile()', () => {
    const SWAGGER_YAML = fs.readFileSync(path.join(__dirname, '../fixtures/swagger/swagger.yaml'), 'utf-8');
    const SWAGGER_JSON = require('../fixtures/swagger/swagger.json');

    const SWAGGER_JSON_HOST_BASEPATH = _.cloneDeep(SWAGGER_JSON);
    SWAGGER_JSON_HOST_BASEPATH.host = 'host.com:8080';
    SWAGGER_JSON_HOST_BASEPATH.basePath = '/p/a/t/h';
    SWAGGER_JSON_HOST_BASEPATH.security = [{ APIKeyHeader: [] }];
    SWAGGER_JSON_HOST_BASEPATH.securityDefinitions = {
      APIKeyHeader: {
        in: 'header',
        name: 'myAwesomeApiKey',
        type: 'apiKey'
      }
    };

    it('should throw if .swagger is not present (SoaJS)', (done) => {
      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves({ result: false, data: 'Oops!' });

      SwaggerService.getSwaggerFile('console-server')
        .then(done.fail)
        .catch((error) => {
          // we voluntarily throw this error
          expect(error.message).to.equal('Not a valid Swagger file');

          expect(requestGet.getCall(0).args).to.eql(['https://upstreamUrl.svc.cluster.local/swagger.yaml', { timeout: 1000 }]);
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(getServiceUrlStub.called).to.equal(false);

          done();
        });
    });

    it('should throw if Swagger is valid, but not parsable to JSON (HTML returned by frontend apps)', (done) => {
      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves('<html>valid swagger, parsed to a string</html>');

      SwaggerService.getSwaggerFile('console-server')
        .then(done.fail)
        .catch((error) => {
          // we voluntarily throw this error
          expect(error.message).to.equal('Not a valid Swagger file');

          expect(getApiPluginsStub.called).to.equal(false); // does not reach this line
          expect(getServiceUrlStub.called).to.equal(false); // does not reach this line
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(requestGet.getCall(0).args).to.eql(['https://upstreamUrl.svc.cluster.local/swagger.yaml', { timeout: 1000 }]);

          done();
        });
    });

    it('should throw if getServiceUpstreamUrl fails', (done) => {
      KubernetesService.getServiceUpstreamUrl.restore();
      getServiceUpstreamUrlStub = sinon.stub(KubernetesService, 'getServiceUpstreamUrl').rejects('error');

      SwaggerService.getSwaggerFile('console-server')
        .then(done.fail)
        .catch(() => {
          expect(getApiPluginsStub.called).to.equal(false); // does not reach this line
          expect(getServiceUrlStub.called).to.equal(false); // does not reach this line
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(requestGet.called).to.equal(false); // does not reach this line

          done();
        });
    });

    it('should throw if failed to parse', (done) => {
      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves('- \ninvalid -- yaml - format');

      SwaggerService.getSwaggerFile('console-server')
        .then(done.fail)
        .catch(() => {
          expect(getApiPluginsStub.called).to.equal(false); // does not reach this line
          expect(getServiceUrlStub.called).to.equal(false); // does not reach this line
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(requestGet.getCall(0).args).to.eql(['https://upstreamUrl.svc.cluster.local/swagger.yaml', { timeout: 1000 }]);

          done();
        });
    });

    it('should return already parsed swaggerJSON if getServiceUrl fails', (done) => {
      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(SWAGGER_YAML);

      KubernetesService.getServiceUrl.restore();
      getServiceUrlStub = sinon.stub(KubernetesService, 'getServiceUrl').rejects('error');

      SwaggerService.getSwaggerFile('console-server')
        .then(swagger => {
          expect(getApiPluginsStub.called).to.equal(false); // does not reach this line
          expect(getServiceUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(requestGet.getCall(0).args).to.eql(['https://upstreamUrl.svc.cluster.local/swagger.yaml', { timeout: 1000 }]);
          expect(swagger).to.eql(SWAGGER_JSON);

          done();
        })
        .catch(done.fail);
    });

    it('should return Swagger as is if already in JSON format', (done) => {
      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(_.cloneDeep(SWAGGER_JSON));

      SwaggerService.getSwaggerFile('console-server')
        .then(swagger => {
          expect(getApiPluginsStub.getCall(0).args).to.eql(['aws', 'console-server']);
          expect(getServiceUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(requestGet.getCall(0).args).to.eql(['https://upstreamUrl.svc.cluster.local/swagger.yaml', { timeout: 1000 }]);
          expect(swagger).to.eql(SWAGGER_JSON_HOST_BASEPATH);

          done();
        })
        .catch(done);
    });

    it('should convert Swagger from YAML to JSON', (done) => {
      request.get.restore();
      requestGet = sinon.stub(request, 'get').resolves(SWAGGER_YAML);

      SwaggerService.getSwaggerFile('console-server')
        .then(swagger => {
          expect(getApiPluginsStub.getCall(0).args).to.eql(['aws', 'console-server']);
          expect(getServiceUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(getServiceUpstreamUrlStub.getCall(0).args).to.eql(['console-server']);
          expect(requestGet.getCall(0).args).to.eql(['https://upstreamUrl.svc.cluster.local/swagger.yaml', { timeout: 1000 }]);
          expect(swagger).to.eql(SWAGGER_JSON_HOST_BASEPATH);

          done();
        })
        .catch(done);
    });
  });

});
