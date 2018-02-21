const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const ProvisionsService = require('../../app/services/provisions.service');
const config = require('../../config/index');

describe('Provisions Service tests', function () {
  let requestGet;
  let requestPost;

  const BASE_URL = config.provisions.baseUrl;
  const KEY = config.provisions.key;

  beforeEach(function () {
    requestGet = sinon.stub(request, 'get').resolves({});
    requestPost = sinon.stub(request, 'post').resolves({});
  });

  afterEach(function () {
    request.get.restore();
    request.post.restore();
  });

  describe('checkDNS()', function () {
    it('should call correct endpoint', function (done) {
      const request = {
        dns: 'avocat',
        type: 'pj.ca'
      };

      ProvisionsService.checkDNS(request)
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/dns');
          expect(requestGet.getCall(0).args[0].json).to.eql(true);
          expect(requestGet.getCall(0).args[0].qs).to.eql({
            key: KEY,
            dns: 'avocat',
            type: 'pj.ca'
          });

          done();
        })
        .catch(done);
    });
  });

  describe('initNewProject()', function () {
    it('should call correct endpoint', function (done) {
      ProvisionsService.initNewProject('CLOUD', 'console-server', { name: 'console-server-db' }, 'markmssd')
        .then(() => {
          expect(requestPost.getCall(0).args[0].uri).to.equal(BASE_URL + '/provisions/CLOUD/console-server');
          expect(requestPost.getCall(0).args[0].json).to.eql(true);
          expect(requestPost.getCall(0).args[0].qs).to.eql({ key: KEY });
          expect(requestPost.getCall(0).args[0].body).to.eql({
            configs: { name: 'console-server-db' },
            requester: 'markmssd'
          });

          done();
        })
        .catch(done);
    });
  });

  describe('provisionService()', function () {
    it('should call correct endpoint', function (done) {
      ProvisionsService.provisionService('CLOUD', 'console-server', 'mongo', { name: 'console-server-db' }, 'markmssd')
        .then(() => {
          expect(requestPost.getCall(0).args[0].uri).to.equal(BASE_URL + '/provisions/CLOUD/console-server/mongo');
          expect(requestPost.getCall(0).args[0].json).to.eql(true);
          expect(requestPost.getCall(0).args[0].qs).to.eql({ key: KEY });
          expect(requestPost.getCall(0).args[0].body).to.eql({
            config: { name: 'console-server-db' },
            requester: 'markmssd'
          });

          done();
        })
        .catch(done);
    });
  });
});
