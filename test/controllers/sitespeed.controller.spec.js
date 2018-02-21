const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const SiteSpeedService = require('../../app/services/sitespeed.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('SiteSpeedController', () => {

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

  describe('listCronJobs()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'listCronJobs').resolves('cronjobs');

      request(app)
        .get('/sitespeed/cronjobs')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'listCronJobs').rejects('error');

      request(app)
        .get('/sitespeed/cronjobs')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'listCronJobs').resolves('cronjobs');

      request(app)
        .get('/sitespeed/cronjobs')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['markmssd']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.contain('cronjobs');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getCronJobS3Reports()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'getCronJobS3Reports').resolves('reports');

      request(app)
        .get('/sitespeed/cronjobs/codekube-ca/reports')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'getCronJobS3Reports').rejects('error');

      request(app)
        .get('/sitespeed/cronjobs/codekube-ca/reports')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'getCronJobS3Reports').resolves('reports');

      request(app)
        .get('/sitespeed/cronjobs/codekube-ca/reports')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['codekube-ca']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.contain('reports');
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('createCronJob()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'createCronJob').resolves('cronjobs');

      request(app)
        .post('/sitespeed/cronjobs')
        .send({ name: 'CronJobName', schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'createCronJob').rejects('error');

      request(app)
        .post('/sitespeed/cronjobs')
        .send({ name: 'CronJobName', schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'createCronJob').resolves('cronjobs');

      request(app)
        .post('/sitespeed/cronjobs')
        .send({ name: 'CronJobName', schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['markmssd', 'CronJobName', '* * * * *', ['google.com'], ['-b', 'chrome']]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.contain('cronjobs');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('updateCronJob()', () => {
    it('should return unauthorized status if not authorized', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'updateCronJob').resolves('cronjob');

      request(app)
        .put('/sitespeed/cronjobs/speed-codekube-ca')
        .send({ schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status if getCronJob service rejects', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').rejects('ouch');
      const updateStub = sinon.stub(SiteSpeedService, 'updateCronJob').resolves('updated');

      request(app)
        .put('/sitespeed/cronjobs/speed-codekube-ca')
        .send({ schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .set('token', token)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          getStub.restore();
          updateStub.restore();

          done();
        })
        .catch(done);
    });

    it('should return 200 status if CronJob not created by current user (markmssd), but is a Admin', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').resolves(require('../fixtures/kubernetes/cronjobs.json').items[1]); // mlopezc1
      const updateStub = sinon.stub(SiteSpeedService, 'updateCronJob').resolves('updated');

      request(app)
        .put('/sitespeed/cronjobs/speed-codekube-ca')
        .send({ schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .set('token', token)
        .expect(httpStatus.OK)
        .then(() => {
          getStub.restore();
          updateStub.restore();

          done();
        })
        .catch(done);
    });

    it('should return 500 status if service rejects', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').resolves(require('../fixtures/kubernetes/cronjobs.json').items[0]); // markmssd
      const updateStub = sinon.stub(SiteSpeedService, 'updateCronJob').rejects('error');

      request(app)
        .put('/sitespeed/cronjobs/speed-codekube-ca')
        .send({ schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          getStub.restore();
          updateStub.restore();

          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').resolves(require('../fixtures/kubernetes/cronjobs.json').items[0]); // markmssd
      const updateStub = sinon.stub(SiteSpeedService, 'updateCronJob').resolves('updated');

      request(app)
        .put('/sitespeed/cronjobs/speed-codekube-ca')
        .send({ schedule: '* * * * *', urls: ['google.com'], args: ['-b', 'chrome'] })
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(updateStub.getCall(0).args).to.eql(['markmssd', 'speed-codekube-ca', '* * * * *', ['google.com'], ['-b', 'chrome']]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('updated');

          getStub.restore();
          updateStub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('deleteCronJob()', () => {
    it('should return unauthorized status if not authorized', (done) => {
      const stub = sinon.stub(SiteSpeedService, 'deleteCronJob').resolves('cronjob');

      request(app)
        .delete('/sitespeed/cronjobs/speed-codekube-ca')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status if getCronJob service rejects', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').rejects('ouch');
      const deleteStub = sinon.stub(SiteSpeedService, 'deleteCronJob').resolves('deleted');

      request(app)
        .delete('/sitespeed/cronjobs/speed-codekube-ca')
        .set('token', token)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          getStub.restore();
          deleteStub.restore();

          done();
        })
        .catch(done);
    });

    it('should return 200 status if CronJob not created by current user (markmssd), but Admin user', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').resolves(require('../fixtures/kubernetes/cronjobs.json').items[1]); // mlopezc1
      const deleteStub = sinon.stub(SiteSpeedService, 'deleteCronJob').resolves('cronjob');

      request(app)
        .delete('/sitespeed/cronjobs/speed-codekube-ca')
        .set('token', token)
        .expect(httpStatus.OK)
        .then(() => {
          getStub.restore();
          deleteStub.restore();

          done();
        })
        .catch(done);
    });

    it('should return 500 status if service rejects', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').resolves(require('../fixtures/kubernetes/cronjobs.json').items[0]); // markmssd
      const deleteStub = sinon.stub(SiteSpeedService, 'deleteCronJob').rejects('error');

      request(app)
        .delete('/sitespeed/cronjobs/speed-codekube-ca')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          getStub.restore();
          deleteStub.restore();

          done();
        })
        .catch(done);
    });

    it('should return values', (done) => {
      const getStub = sinon.stub(SiteSpeedService, 'getCronJob').resolves(require('../fixtures/kubernetes/cronjobs.json').items[0]); // markmssd
      const deleteStub = sinon.stub(SiteSpeedService, 'deleteCronJob').resolves('deleted');

      request(app)
        .delete('/sitespeed/cronjobs/speed-codekube-ca')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(deleteStub.getCall(0).args).to.eql(['markmssd', 'speed-codekube-ca']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('deleted');

          getStub.restore();
          deleteStub.restore();
          done();
        })
        .catch(done);
    });
  });

});
