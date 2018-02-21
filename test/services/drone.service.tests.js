const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const DroneService = require('../../app/services/drone.service');
const config = require('../../config/index');

describe('Drone Service tests', () => {
  let requestGet;

  const BASE_URL = config.drone.deploymentsCounter.baseUrl;
  const KEY = config.drone.deploymentsCounter.key;

  beforeEach(() => {
    requestGet = sinon.stub(request, 'get').resolves(12);
  });

  afterEach(() => {
    request.get.restore();
  });

  describe('getDeploymentsCount()', () => {
    it('should call correct endpoint for getDeploymentsCount', (done) => {
      DroneService.getDeploymentsCount()
        .then(() => {
          expect(requestGet.getCall(0).args[0]).to.equal(BASE_URL);
          expect(requestGet.getCall(0).args[1].json).to.eql(true);
          expect(requestGet.getCall(0).args[1].qs).to.eql({ key: KEY });

          done();
        })
        .catch(done);
    });
  });

  describe('getAllRepositories()', () => {
    it('should call correct endpoint for getAllRepositories', (done) => {
      DroneService.getAllRepositories()
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(`${config.drone.baseUrl}/api/user/repos`);
          expect(requestGet.getCall(0).args[0].json).to.eql(true);
          expect(requestGet.getCall(0).args[0].qs).to.eql({ all: true, flush: true });

          done();
        })
        .catch(done);
    });
  });

});
