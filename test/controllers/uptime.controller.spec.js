const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const UptimeService = require('../../app/services/uptime.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('UptimeController', () => {

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

  describe('getSLA()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(UptimeService, 'getSLA').resolves(100);

      request(app)
        .get('/uptimes/sla')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(UptimeService, 'getSLA').rejects('error');

      request(app)
        .get('/uptimes/sla')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(UptimeService, 'getSLA').resolves(100);

      request(app)
        .get('/uptimes/sla?uptimeId=UptimeId&category=Service&kind=Ingress&namespace=console-server&downStartDate=4&duration=12')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(100);
          expect(stub.getCall(0).args[0]).to.eql({
            uptimeId: 'UptimeId',
            category: 'Service',
            kind: 'Ingress',
            namespace: 'console-server',
            downStartDate: '4',
            duration: '12'
          });
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getUptimes()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(UptimeService, 'getUptimes').resolves(100);

      request(app)
        .get('/uptimes/uptimes')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(UptimeService, 'getUptimes').rejects('error');

      request(app)
        .get('/uptimes/uptimes')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(UptimeService, 'getUptimes').resolves(100);

      request(app)
        .get('/uptimes/uptimes?uptimeId=UptimeId&category=Service&kind=Ingress&namespace=console-server&interval=daily&since=12&to=27')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(100);
          expect(stub.getCall(0).args[0]).to.eql({
            uptimeId: 'UptimeId',
            category: 'Service',
            kind: 'Ingress',
            namespace: 'console-server',
            interval: 'daily',
            since: '12',
            to: '27'
          });
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getDowntimes()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(UptimeService, 'getDowntimes').resolves(100);

      request(app)
        .get('/uptimes/downtimes')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(UptimeService, 'getDowntimes').rejects('error');

      request(app)
        .get('/uptimes/downtimes')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(UptimeService, 'getDowntimes').resolves(100);

      request(app)
        .get('/uptimes/downtimes?uptimeId=UptimeId&category=Service&kind=Ingress&namespace=console-server&downStartDate=12&duration=27')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(100);
          expect(stub.getCall(0).args[0]).to.eql({
            uptimeId: 'UptimeId',
            category: 'Service',
            kind: 'Ingress',
            namespace: 'console-server',
            downStartDate: '12',
            duration: '27'
          });
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getInfras()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(UptimeService, 'getInfras').resolves('infras');

      request(app)
        .get('/uptimes/infras')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(UptimeService, 'getInfras').rejects('error');

      request(app)
        .get('/uptimes/infras')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(UptimeService, 'getInfras').resolves('infras');

      request(app)
        .get('/uptimes/infras?kind=Mongo')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('infras');
          expect(stub.getCall(0).args[0]).to.eql({
            kind: 'Mongo'
          });
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getInfrasUptimes()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(UptimeService, 'getInfrasUptimes').resolves('uptimes');

      request(app)
        .get('/uptimes/infras/uptimes')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(UptimeService, 'getInfrasUptimes').rejects('error');

      request(app)
        .get('/uptimes/infras/uptimes')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values, and pass queryParams', (done) => {
      const stub = sinon.stub(UptimeService, 'getInfrasUptimes').resolves('uptimes');

      request(app)
        .get('/uptimes/infras/uptimes?kind=Mongo')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('uptimes');
          expect(stub.getCall(0).args[0]).to.eql({
            kind: 'Mongo'
          });
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
