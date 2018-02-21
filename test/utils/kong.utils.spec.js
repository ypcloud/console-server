const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const KongUtils = require('../../app/utils/kong.utils');

describe('KongUtils tests', () => {

  describe('getUrl()', () => {
    it('should return no url if passed none', () => {
      const url = KongUtils.getUrl(null);
      expect(url).to.equal(undefined);
    });

    it('should return no url if passed unknown cluster', () => {
      const url = KongUtils.getUrl('unknown');
      expect(url).to.equal(undefined);
    });

    it('should return AWS url', () => {
      const url = KongUtils.getUrl('aws');
      expect(url).to.equal('https://kongAwsUrl.com');
    });

    it('should return GCE url', () => {
      const url = KongUtils.getUrl('gce');
      expect(url).to.equal('https://kongGceUrl.com');
    });
  });

  describe('getAuth()', () => {
    it('should return no bearer if passed none', () => {
      const url = KongUtils.getAuth(null);

      expect(url).to.eql({
        auth: {
          bearer: undefined
        },
        json: true
      });
    });

    it('should return no bearer if passed unknown cluster', () => {
      const url = KongUtils.getAuth('unknown');

      expect(url).to.eql({
        auth: {
          bearer: undefined
        },
        json: true
      });
    });

    it('should return AWS auth', () => {
      const auth = KongUtils.getAuth('aws');

      expect(auth).to.eql({
        auth: {
          bearer: 'KONG_TOKEN_AWS'
        },
        json: true
      });
    });

    it('should return GCE url', () => {
      const auth = KongUtils.getAuth('gce');

      expect(auth).to.eql({
        auth: {
          bearer: 'KONG_TOKEN_GCE'
        },
        json: true
      });
    });
  });

  describe('extractNamespaceFromConsumer()', () => {
    it('should return empty string if passed null', () => {
      const namespace = KongUtils.extractNamespaceFromConsumer();
      expect(namespace).to.equal('');
    });

    it('should return empty string if consumer.username has no `@`', () => {
      const consumer = {
        username: 'default_console-server-develop',
      };

      const namespace = KongUtils.extractNamespaceFromConsumer(consumer);
      expect(namespace).to.equal('');
    });

    it('should return namespace', () => {
      const consumers = require('../fixtures/kong/consumers.json');

      const namespace = KongUtils.extractNamespaceFromConsumer(consumers.data[0]);
      expect(namespace).to.equal('console-server-develop');
    });
  });

  describe('extractNamespaceFromConsumerUsername()', () => {
    it('should return empty string if passed null', () => {
      const namespace = KongUtils.extractNamespaceFromConsumerUsername(null);
      expect(namespace).to.equal('');
    });

    it('should return empty string if username has no `@`', () => {
      const namespace = KongUtils.extractNamespaceFromConsumerUsername('default_console-server-develop');
      expect(namespace).to.equal('');
    });

    it('should return namespace', () => {
      const namespace = KongUtils.extractNamespaceFromConsumerUsername('default@console-server-develop');
      expect(namespace).to.equal('console-server-develop');
    });
  });

  describe('constructApiName()', () => {
    it('should drop undefined/null values', () => {
      const apiName = KongUtils.constructApiName(null, null);
      expect(apiName).to.equal('api.ypcgw');
    });

    it('should use namespace value only', () => {
      const apiName = KongUtils.constructApiName(null, 'console-server-develop');
      expect(apiName).to.equal('console-server-develop.api.ypcgw');
    });

    it('should drop undefined values, service.name and service.version', () => {
      const ingressLabels = {
        'codekube.io/service.env': 'dev',
        'codekube.io/service.group': 'cloud',
        'codekube.io/service.name': 'consoleServer',
        'codekube.io/service.version': 'v1'
      };

      const apiName = KongUtils.constructApiName(ingressLabels, 'console-server-develop');
      expect(apiName).to.equal('consoleServer.cloud.v1.console-server-develop.api.ypcgw');
    });

    it('should use all values properly, except env', () => {
      const ingressLabels = {
        'codekube.io/service.env': 'dev',
        'codekube.io/service.group': 'cloud',
        'codekube.io/service.version': null
      };

      const apiName = KongUtils.constructApiName(ingressLabels, 'console-server-develop');
      expect(apiName).to.equal('cloud.console-server-develop.api.ypcgw');
    });
  });

});
