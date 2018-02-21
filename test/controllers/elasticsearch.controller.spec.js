const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const ElasticSearchService = require('../../app/services/elasticsearch.service');
const APICatalogService = require('../../app/services/api-catalog.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('ElasticSearchController', () => {

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

  describe('searchByNamespace()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(ElasticSearchService, 'searchByNamespace').resolves('logs');

      request(app)
        .get('/elasticsearch/search/console-server?searchText=Text&timestamp=Timestamp&rangeType=RangeType&order=Order&lowerBoundTimestamp=12&upperBoundTimestamp=27')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(ElasticSearchService, 'searchByNamespace').rejects('error');

      request(app)
        .get('/elasticsearch/search/console-server?searchText=Text&timestamp=Timestamp&rangeType=RangeType&order=Order&lowerBoundTimestamp=12&upperBoundTimestamp=27')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return values', (done) => {
      const stub = sinon.stub(ElasticSearchService, 'searchByNamespace').resolves(['1', '2', '3']);

      request(app)
        .get('/elasticsearch/search/console-server?searchText=Text&timestamp=Timestamp&rangeType=RangeType&order=Order&lowerBoundTimestamp=12&upperBoundTimestamp=27')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['console-server', 'Text', 'Timestamp', 'RangeType', 'Order', '12', '27']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['1', '2', '3']);

          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });
  });

  describe('searchAPICatalog()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(APICatalogService, 'searchAPICatalog').resolves('apis');

      request(app)
        .get('/elasticsearch/api-catalog/dev?serviceGroup=github&searchTerms=console-server,cloud')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(APICatalogService, 'searchAPICatalog').rejects('error');

      request(app)
        .get('/elasticsearch/api-catalog/dev?serviceGroup=github&searchTerms=console-server,cloud')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return values', (done) => {
      const stub = sinon.stub(APICatalogService, 'searchAPICatalog').resolves(['apis']);

      request(app)
        .get('/elasticsearch/api-catalog/dev?serviceGroup=github&searchTerms=console-server, cloud')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['dev', 'github', 'console-server, cloud']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(['apis']);

          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });
  });

  describe('getServiceGroups()', () => {
    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(APICatalogService, 'getServiceGroups').resolves('groups');

      request(app)
        .get('/elasticsearch/api-catalog/dev/service-groups')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(APICatalogService, 'getServiceGroups').rejects('error');

      request(app)
        .get('/elasticsearch/api-catalog/dev/service-groups')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });

    it('should return values', (done) => {
      const stub = sinon.stub(APICatalogService, 'getServiceGroups').resolves('groups');

      request(app)
        .get('/elasticsearch/api-catalog/dev/service-groups')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(stub.getCall(0).args).to.eql(['dev']);
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql('groups');

          stub.restore();
          done();
        })
        .catch((error) => {
          stub.restore();
          done(error);
        });
    });
  });
});
