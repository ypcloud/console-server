const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const ConsulService = require('../../app/services/consul.service');

describe('ConsulService', () => {
  let requestGet;
  let requestPut;
  let requestDel;

  const BASE_URL = 'http://consulUrl.com:4500';
  const TOKEN = 'CONSUL_TOKEN';
  const DC = 'aws';

  const KEYS_RESPONSE = require('../fixtures/consul/consul-keys.json');
  const KEY_RESPONSE = require('../fixtures/consul/consul-values.json');

  beforeEach(function () {
    requestPut = sinon.stub(request, 'put').resolves({});
    requestDel = sinon.stub(request, 'del').resolves({});
  });

  afterEach(function () {
    request.put.restore();
    request.del.restore();
  });

  // keys starting with . are filtered out
  describe('keys()', function () {
    it('should call correct endpoint, null key', function (done) {
      requestGet = sinon.stub(request, 'get').returns(Promise.resolve(KEYS_RESPONSE));

      ConsulService.keys(null)
        .then((keys) => {
          expect(keys).to.eql(KEYS_RESPONSE);
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/v1/kv/svc');
          expect(requestGet.getCall(0).args[0].qs.dc).to.equal(DC);
          expect(requestGet.getCall(0).args[0].qs.token).to.equal(TOKEN);
          expect(requestGet.getCall(0).args[0].qs.recurse).to.equal(true);
          expect(requestGet.getCall(0).args[0].qs.keys).to.equal(true);
          expect(requestGet.getCall(0).args[0].qs.separator).to.equal('/');

          request.get.restore();
          done();
        })
        .catch(() => {
          request.get.restore();
          done();
        });
    });

    it('should call correct endpoint', function (done) {
      requestGet = sinon.stub(request, 'get').returns(Promise.resolve(KEYS_RESPONSE));

      ConsulService.keys('key1/key2')
        .then((keys) => {
          expect(keys).to.eql(KEYS_RESPONSE);
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/v1/kv/svc/key1/key2');
          expect(requestGet.getCall(0).args[0].qs.dc).to.equal(DC);
          expect(requestGet.getCall(0).args[0].qs.token).to.equal(TOKEN);
          expect(requestGet.getCall(0).args[0].qs.recurse).to.equal(true);
          expect(requestGet.getCall(0).args[0].qs.keys).to.equal(true);
          expect(requestGet.getCall(0).args[0].qs.separator).to.equal('/');

          request.get.restore();
          done();
        })
        .catch(() => {
          request.get.restore();
          done();
        });
    });
  });

  describe('get()', function () {
    it('should call correct endpoint', function (done) {
      requestGet = sinon.stub(request, 'get').returns(Promise.resolve(KEY_RESPONSE));

      ConsulService.get('key1/key2')
        .then((keys) => {
          expect(keys).to.eql([{
            LockIndex: 0,
            Key: 'svc/',
            Flags: 0,
            Value: 'Value!',
            CreateIndex: 1078694,
            ModifyIndex: 1078694
          }]);
          expect(requestGet.getCall(0).args[0].uri).to.equal(BASE_URL + '/v1/kv/svc/key1/key2');
          expect(requestGet.getCall(0).args[0].qs.dc).to.equal(DC);
          expect(requestGet.getCall(0).args[0].qs.token).to.equal(TOKEN);
          expect(requestGet.getCall(0).args[0].qs.raw).to.equal(true);
          expect(requestGet.getCall(0).args[0].qs.recurse).to.equal(undefined);
          expect(requestGet.getCall(0).args[0].qs.keys).to.equal(undefined);

          request.get.restore();
          done();
        })
        .catch(() => {
          request.get.restore();
          done();
        });
    });
  });

  describe('set()', function () {
    it('should call correct endpoint', function (done) {
      ConsulService.set('key1/key2', 'value!')
        .then(function () {
          expect(requestPut.getCall(0).args[0].uri).to.equal(BASE_URL + '/v1/kv/svc/key1/key2');
          expect(requestPut.getCall(0).args[0].qs.dc).to.equal(DC);
          expect(requestPut.getCall(0).args[0].qs.token).to.equal(TOKEN);
          expect(requestPut.getCall(0).args[0].body).to.eql('value!');

          done();
        })
        .catch(done);
    });
  });

  describe('del()', function () {
    it('should call correct endpoint', function (done) {
      ConsulService.del('key1/key2')
        .then(function () {
          expect(requestDel.getCall(0).args[0].uri).to.equal(BASE_URL + '/v1/kv/svc/key1/key2');
          expect(requestDel.getCall(0).args[0].qs.dc).to.equal(DC);
          expect(requestDel.getCall(0).args[0].qs.token).to.equal(TOKEN);
          expect(requestDel.getCall(0).args[0].qs.recurse).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

});
