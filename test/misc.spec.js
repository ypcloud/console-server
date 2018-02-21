const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const app = require('../server').app;

describe('Misc', () => {
  describe('GET /health', () => {
    it('should return OK', (done) => {
      request(app)
        .get('/health')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).to.equal('OK');
          done();
        })
        .catch(done);
    });
  });

  describe('GET /api/404', () => {
    it('should return 404 status', (done) => {
      request(app)
        .get('/api/404')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });
});
