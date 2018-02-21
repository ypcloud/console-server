const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const EventsService = require('../../app/services/events.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('EventsController', () => {

  let token = null;

  before((done) => {
    loginHelpers.createUser(USER)
      .then(user => loginHelpers.getJWT(user.username))
      .then(jwt => {
        token = jwt;
        done();
      });
  });

  after((done) => {
    loginHelpers.deleteUser(USER.username)
      .then(() => {
        token = null;
        done();
      });
  });

  describe('getEvents()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(EventsService, 'getEvents').resolves(['event1', 'event2']);

      request(app)
        .get('/events')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(EventsService, 'getEvents').rejects('error');

      request(app)
        .get('/events')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass namespace queryParam', (done) => {
      const stub = sinon.stub(EventsService, 'getEvents').resolves(['event1', 'event2']);

      request(app)
        .get('/events?namespace=console-server&user=mark')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['event1', 'event2']);
          expect(stub.getCall(0).args[0]).to.eql({ namespace: 'console-server', user: 'mark' });
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
