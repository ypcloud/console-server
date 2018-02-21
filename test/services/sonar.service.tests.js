const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const SonarService = require('../../app/services/sonar.service');
const config = require('../../config/index');

describe('Sonar Service tests', function () {
  let requestGet;

  const BASE_URL = config.sonar.baseUrl;
  const CREDENTIALS = config.sonar.credentials;

  beforeEach(function () {
    requestGet = sinon.stub(request, 'get').resolves({});
  });

  afterEach(function () {
    request.get.restore();
  });

  describe('getMetrics()', function () {
    it('should call correct endpoint for getMetrics, null branch and metrics', function (done) {
      SonarService.getMetrics('OWNER', 'REPO', null, null)
        .then(function () {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/api/measures/component');
          expect(requestGet.getCall(0).args[0].auth).to.eql(CREDENTIALS);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            componentKey: 'OWNER:REPO', // OWNER:REPO:master
            metricKeys: ''
          });

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for getMetrics, empty metrics', function (done) {
      SonarService.getMetrics('OWNER', 'REPO', 'develop', '')
        .then(function () {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/api/measures/component');
          expect(requestGet.getCall(0).args[0].auth).to.eql(CREDENTIALS);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            componentKey: 'OWNER:REPO', // OWNER:REPO:develop
            metricKeys: ''
          });

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for getMetrics, release branch', function (done) {
      SonarService.getMetrics('OWNER', 'REPO', 'release', '')
        .then(function () {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/api/measures/component');
          expect(requestGet.getCall(0).args[0].auth).to.eql(CREDENTIALS);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            componentKey: 'OWNER:REPO', // OWNER:REPO:release
            metricKeys: ''
          });

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint for getMetrics, with spaces', function (done) {
      SonarService.getMetrics('OWNER', 'REPO', 'master', ' coverage, violations  ')
        .then(function () {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/api/measures/component');
          expect(requestGet.getCall(0).args[0].auth).to.eql(CREDENTIALS);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            componentKey: 'OWNER:REPO', // OWNER:REPO:master
            metricKeys: 'coverage,violations'
          });
          done();
        })
        .catch(done);
    });
  });

  describe('getProjects()', function () {
    it('should call correct endpoint for getProjects', function (done) {
      SonarService.getProjects()
        .then(function () {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/api/components/search');
          expect(requestGet.getCall(0).args[0].auth).to.eql(CREDENTIALS);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            qualifiers: 'TRK',
            ps: 2000
          });

          done();
        })
        .catch(done);
    });
  });

});
