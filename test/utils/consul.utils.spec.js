const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const ConsulUtils = require('../../app/utils/consul.utils');

describe('ConsulUtils tests', function () {

  describe('isEmptyKey()', function () {
    it('should return true if null', function (done) {
      const isEmptyKey = ConsulUtils.isEmptyKey(null);

      expect(isEmptyKey).to.equal(true);
      done();
    });

    it('should return true if \'\'', function (done) {
      const isEmptyKey = ConsulUtils.isEmptyKey('');

      expect(isEmptyKey).to.equal(true);
      done();
    });

    it('should return true if \' \'', function (done) {
      const isEmptyKey = ConsulUtils.isEmptyKey(' ');

      expect(isEmptyKey).to.equal(true);
      done();
    });

    it('should return true if \'     \'', function (done) {
      const isEmptyKey = ConsulUtils.isEmptyKey('    ');

      expect(isEmptyKey).to.equal(true);
      done();
    });

    it('should return false if not empty', function (done) {
      const isEmptyKey = ConsulUtils.isEmptyKey('a');

      expect(isEmptyKey).to.equal(false);
      done();
    });
  });

  describe('isLastSlash()', function () {
    it('should return false', function (done) {
      const isLastSlash = ConsulUtils.isLastSlash(null);

      expect(isLastSlash).to.equal(false);
      done();
    });

    it('should return false', function (done) {
      const isLastSlash = ConsulUtils.isLastSlash('');

      expect(isLastSlash).to.equal(false);
      done();
    });

    it('should return false', function (done) {
      const isLastSlash = ConsulUtils.isLastSlash('key1/key2');

      expect(isLastSlash).to.equal(false);
      done();
    });

    it('should return true', function (done) {
      const isLastSlash = ConsulUtils.isLastSlash('key1/key2/');

      expect(isLastSlash).to.equal(true);
      done();
    });

    it('should return true', function (done) {
      const isLastSlash = ConsulUtils.isLastSlash('key1/key2//');

      expect(isLastSlash).to.equal(true);
      done();
    });
  });

  describe('stripKeySlashes()', function () {
    it('should return empty string', function (done) {
      const key = ConsulUtils.stripKeySlashes(null);

      expect(key).to.equal('');
      done();
    });

    it('should return key empty string', function (done) {
      const key = ConsulUtils.stripKeySlashes('');

      expect(key).to.equal('');
      done();
    });

    it('should return key as is, if no double slashes', function (done) {
      const key = ConsulUtils.stripKeySlashes('key1/key2/key3');

      expect(key).to.equal('key1/key2/key3');
      done();
    });

    it('should clean key extra slashes', function (done) {
      const key = ConsulUtils.stripKeySlashes('key1//key2/key3//');

      expect(key).to.equal('key1/key2/key3/');
      done();
    });

    it('should clean key extra slashes', function (done) {
      const key = ConsulUtils.stripKeySlashes('key1///key2////key3/////');

      expect(key).to.equal('key1/key2/key3/');
      done();
    });

    it('should strip out first slash', function (done) {
      const key = ConsulUtils.stripKeySlashes('/key1//key2/key3//');

      expect(key).to.equal('key1/key2/key3/');
      done();
    });

    it('should strip out first slashes', function (done) {
      const key = ConsulUtils.stripKeySlashes('//key1//key2/key3//');

      expect(key).to.equal('key1/key2/key3/');
      done();
    });

    it('should strip out first slashes', function (done) {
      const key = ConsulUtils.stripKeySlashes('///key1//key2/key3//');

      expect(key).to.equal('key1/key2/key3/');
      done();
    });

    it('should strip out first slashes', function (done) {
      const key = ConsulUtils.stripKeySlashes('////key1//key2/key3//');

      expect(key).to.equal('key1/key2/key3/');
      done();
    });

  });

  describe('isSecretKey()', function () {
    it('should return false if no key', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey(null);

      expect(isSecretKey).to.equal(false);
      done();
    });

    it('should return false if key is empty string', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey('');

      expect(isSecretKey).to.equal(false);
      done();
    });

    it('should return false if key contains dots in the middle', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey('key./key.key/');

      expect(isSecretKey).to.equal(false);
      done();
    });

    it('should return true if key is a dot', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey('.');

      expect(isSecretKey).to.equal(true);
      done();
    });

    it('should return true if key contains dot at beginning', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey('.key/key/');

      expect(isSecretKey).to.equal(true);
      done();
    });

    it('should return true if key contains dot after any slash', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey('key/.key/');

      expect(isSecretKey).to.equal(true);
      done();
    });

    it('should return true if key contains dot after any slash and in the middle', function (done) {
      const isSecretKey = ConsulUtils.isSecretKey('key/.key.key./');

      expect(isSecretKey).to.equal(true);
      done();
    });
  });
});
