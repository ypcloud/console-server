const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const ProvisionsService = require('../../app/services/provisions.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('ProvisionsController', () => {

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

  describe('checkDNS()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ProvisionsService, 'checkDNS').resolves('available');

      request(app)
        .get('/provisions/dns?dns=avocat&type=pj.ca')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(ProvisionsService, 'checkDNS').rejects('error');

      request(app)
        .get('/provisions/dns?dns=avocat&type=pj.ca')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(ProvisionsService, 'checkDNS').resolves('available');

      request(app)
        .get('/provisions/dns?dns=avocat&type=pj.ca')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('available');
          expect(stub.getCall(0).args[0]).to.eql({
            dns: 'avocat',
            type: 'pj.ca'
          });

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('initNewProject()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ProvisionsService, 'initNewProject').resolves('initialized');

      request(app)
        .post('/provisions/CLOUD/console-server')
        .send({ configs: { name: 'console-server-db' } })
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(ProvisionsService, 'initNewProject').rejects('error');

      request(app)
        .post('/provisions/CLOUD/console-server')
        .send({ configs: { name: 'console-server-db' } })
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(ProvisionsService, 'initNewProject').resolves('initialized');

      request(app)
        .post('/provisions/CLOUD/console-server')
        .send({ configs: { name: 'console-server-db' } })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('initialized');
          expect(stub.getCall(0).args).to.eql(['CLOUD', 'console-server', { name: 'console-server-db' }, 'markmssd']);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('provisionService()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ProvisionsService, 'provisionService').resolves('provisioned');

      request(app)
        .post('/provisions/CLOUD/console-server/mongo')
        .send({ config: { name: 'console-server-db' } })
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(ProvisionsService, 'provisionService').rejects('error');

      request(app)
        .post('/provisions/CLOUD/console-server/mongo')
        .send({ config: { name: 'console-server-db' } })
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(ProvisionsService, 'provisionService').resolves('provisioned');

      request(app)
        .post('/provisions/CLOUD/console-server/mongo')
        .send({ config: { name: 'console-server-db' } })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('provisioned');
          expect(stub.getCall(0).args).to.eql(['CLOUD', 'console-server', 'mongo', { name: 'console-server-db' }, 'markmssd']);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });
});
