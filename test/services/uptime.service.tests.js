const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const KubernetesService = require('../../app/services/kubernetes.service');
const UptimeService = require('../../app/services/uptime.service');
const config = require('../../config/index');

describe('Uptime Service tests', function () {
  let requestGet;

  const BASE_URL = config.uptime.baseUrl;
  const KEY = config.uptime.key;

  beforeEach(function () {
    requestGet = sinon.stub(request, 'get').resolves({});
  });

  afterEach(function () {
    request.get.restore();
  });

  describe('getSLA()', function () {
    it('should call correct endpoint', function (done) {
      sinon.stub(KubernetesService, 'getServiceUrl').resolves('https://serviceUrl.com');

      const request = {
        uptimeId: 'UptimeId',
        category: 'Service',
        kind: 'Ingress',
        namespace: 'console-server',
        since: 4,
        to: 12,
      };

      UptimeService.getSLA(request)
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/sla');
          expect(requestGet.getCall(0).args[0].json).to.eql(true);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            key: KEY,
            uptimeId: 'UptimeId',
            category: 'Service',
            kind: 'Ingress',
            namespace: 'console-server',
            url: 'https://serviceUrl.com/health',
            since: 4,
            to: 12
          });

          KubernetesService.getServiceUrl.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getUptimes()', function () {
    it('should call correct endpoint', function (done) {
      sinon.stub(KubernetesService, 'getServiceUrl').resolves('https://serviceUrl.com');

      const request = {
        uptimeId: 'UptimeId',
        category: 'Service',
        kind: 'Ingress',
        namespace: 'console-server',
        interval: 'daily',
        since: 12,
        to: 27
      };

      UptimeService.getUptimes(request)
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/uptimes');
          expect(requestGet.getCall(0).args[0].json).to.eql(true);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            key: KEY,
            uptimeId: 'UptimeId',
            category: 'Service',
            kind: 'Ingress',
            namespace: 'console-server',
            url: 'https://serviceUrl.com/health',
            interval: 'daily',
            since: 12,
            to: 27
          });

          KubernetesService.getServiceUrl.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getDowntimes()', function () {
    it('should call correct endpoint', function (done) {
      sinon.stub(KubernetesService, 'getServiceUrl').resolves('https://serviceUrl.com');

      const request = {
        uptimeId: 'UptimeId',
        category: 'Service',
        kind: 'Ingress',
        namespace: 'console-server',
        since: 12,
        to: 27
      };

      UptimeService.getDowntimes(request)
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/downtimes');
          expect(requestGet.getCall(0).args[0].json).to.eql(true);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            key: KEY,
            uptimeId: 'UptimeId',
            category: 'Service',
            kind: 'Ingress',
            namespace: 'console-server',
            url: 'https://serviceUrl.com/health',
            since: 12,
            to: 27
          });

          KubernetesService.getServiceUrl.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getInfras()', function () {
    it('should call correct endpoint', function (done) {
      const request = {
        kind: 'Mongo'
      };

      UptimeService.getInfras(request)
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/infras');
          expect(requestGet.getCall(0).args[0].json).to.eql(true);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            key: KEY,
            kind: 'Mongo'
          });

          done();
        })
        .catch(done);
    });
  });

});
