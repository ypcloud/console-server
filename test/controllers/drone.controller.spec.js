const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const DroneService = require('../../app/services/drone.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('DroneController', () => {

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

  describe('getDeploymentsCount()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'getDeploymentsCount').resolves(12);

      request(app)
        .get('/drone/deployments/total')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'getDeploymentsCount').rejects('error');

      request(app)
        .get('/drone/deployments/total')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return deployments count', (done) => {
      const stub = sinon.stub(DroneService, 'getDeploymentsCount').resolves(12);

      request(app)
        .get('/drone/deployments/total')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql([]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(12);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getBuilds()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuilds').resolves(['builds']);

      request(app)
        .get('/drone/builds/Owner/Name')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuilds').rejects('error');

      request(app)
        .get('/drone/builds/Owner/Name')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return builds 100 latest builds', (done) => {
      const THOUSAND_BUILDS = [];
      for (let i = 1; i <= 1000; ++i) {
        THOUSAND_BUILDS.push(`Build_#${i}`);
      }

      const stub = sinon.stub(DroneService, 'getBuilds').resolves(THOUSAND_BUILDS);

      request(app)
        .get('/drone/builds/Owner/Name')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data.length).to.equal(100);
          expect(res.body.data).to.eql(THOUSAND_BUILDS.slice(0, 100));

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getContributors()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuilds').resolves(['builds']);

      request(app)
        .get('/drone/builds/Owner/Name/contributors')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuilds').rejects('error');

      request(app)
        .get('/drone/builds/Owner/Name/contributors')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return contributors, ordered by commitsCount', (done) => {
      const BUILDS = require('../fixtures/drone/builds.json');
      const stub = sinon.stub(DroneService, 'getBuilds').resolves(BUILDS);

      const EXPECTED = [
        {
          name: 'Mark Massoud',
          avatar: 'https://www.gravatar.com/avatar/621c630593e999d380c63d70e7f56022.jpg',
          commitsCount: 4
        }, {
          name: 'Val Astraverkhau',
          avatar: 'https://www.gravatar.com/avatar/2e332e1946e851142bfcc7bb74027f20.jpg',
          commitsCount: 1
        }
      ];

      request(app)
        .get('/drone/builds/Owner/Name/contributors')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(EXPECTED);

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getBuild()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuild').resolves('build');

      request(app)
        .get('/drone/builds/Owner/Name/12')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuild').rejects('error');

      request(app)
        .get('/drone/builds/Owner/Name/12')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return one build', (done) => {
      const stub = sinon.stub(DroneService, 'getBuild').resolves('build');

      request(app)
        .get('/drone/builds/Owner/Name/12')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name', 12]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('build');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getLatestBuild()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'getLastBuild').resolves('build');

      request(app)
        .get('/drone/builds/Owner/Name/latest')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'getLastBuild').rejects('error');

      request(app)
        .get('/drone/builds/Owner/Name/latest')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return one build', (done) => {
      const stub = sinon.stub(DroneService, 'getLastBuild').resolves('build');

      request(app)
        .get('/drone/builds/Owner/Name/latest?branch=develop')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name', 'develop']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('build');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('restartBuild()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'restartBuild').resolves('build');

      request(app)
        .post('/drone/builds/Owner/Name/12')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'restartBuild').rejects('error');

      request(app)
        .post('/drone/builds/Owner/Name/12')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return one build', (done) => {
      const stub = sinon.stub(DroneService, 'restartBuild').resolves('restarted');

      request(app)
        .post('/drone/builds/Owner/Name/12')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name', '12']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('restarted');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('stopBuild()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'stopBuild').resolves('build');

      request(app)
        .delete('/drone/builds/Owner/Name/12/1')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'stopBuild').rejects('error');

      request(app)
        .delete('/drone/builds/Owner/Name/12/1')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return one build', (done) => {
      const stub = sinon.stub(DroneService, 'stopBuild').resolves('stopped');

      request(app)
        .delete('/drone/builds/Owner/Name/12/1')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name', '12', '1']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.equal('stopped');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

  describe('getBuildLogs()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuildLogs').resolves(['logs']);

      request(app)
        .get('/drone/builds/Owner/Name/logs/12/1')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(DroneService, 'getBuildLogs').rejects('error');

      request(app)
        .get('/drone/builds/Owner/Name/logs/12/1')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return one build', (done) => {
      const stub = sinon.stub(DroneService, 'getBuildLogs').resolves(['logs']);

      request(app)
        .get('/drone/builds/Owner/Name/logs/12/1')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['Owner', 'Name', 12, 1]);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.contain('logs');

          stub.restore();
          done();
        })
        .catch(done);
    });
  });

});
