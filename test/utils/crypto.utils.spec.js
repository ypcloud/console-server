const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const CryptoUtils = require('../../app/utils/crypto.utils');
const config = require('../../config');

describe('CryptoUtils tests', function () {
  const SECRET = config.bitbucket.secretKey;

  describe('AES256 encrypt/decrypt()', function () {
    it('should return initial string', function (done) {
      const initial = 'Hello World';
      const encrypted = CryptoUtils.encrypt(initial, SECRET);
      const decrypted = CryptoUtils.decrypt(encrypted, SECRET);

      expect(decrypted).to.equal(initial);
      done();
    });

    it('should return initial string, supporting weird symbols', function (done) {
      const initial = 'Hello World 123~!@#$%^&*()__+-={}[]\||;:\'"<>,./';
      const encrypted = CryptoUtils.encrypt(initial, SECRET);
      const decrypted = CryptoUtils.decrypt(encrypted, SECRET);

      expect(decrypted).to.equal(initial);
      done();
    });
  });

});
