const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const app = require('../../server').app;

describe('Home', () => {
  it('should return OK', (done) => {

    request(app)
      .get('/')
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.text).to.equal('Welcome to codekube Console-Server!');
        done();
      })
      .catch(done);
  });
});
