const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { before, after } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const BitbucketService = require('../../app/services/bitbucket.service');
const app = require('../../server').app;
const loginHelpers = require('../helpers/login');

const USER = require('../fixtures/user.json');

describe('BitbucketController', () => {

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

  describe('getUserProjects()', () => {
    const PROJECTS = require('../fixtures/bitbucket/projects.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(BitbucketService, 'getUserProjects').resolves(PROJECTS);

      request(app)
        .get('/bitbucket/projects')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(BitbucketService, 'getUserProjects').rejects('error');

      request(app)
        .get('/bitbucket/projects')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return projects', (done) => {
      const stub = sinon.stub(BitbucketService, 'getUserProjects').resolves(PROJECTS);
      const EXPECTED = {
        size: 6,
        limit: 1000,
        isLastPage: true,
        values: [
          {
            key: 'ARCHITECTURE',
            name: 'Architecture',
          },
          {
            key: 'BOOK',
            name: 'Bookenda',
          },
          {
            key: 'BCM',
            name: 'Build & Configuration Management',
          },
          {
            key: 'CANADA411-MOBILE',
            name: 'Canada411 Mobile',
          },
          {
            key: 'CANPAGES-MOBILE',
            name: 'Canpages Mobile',
          },
          {
            key: 'CLOUD',
            name: 'Cloud',
          }
        ]
      };

      request(app)
        .get('/bitbucket/projects')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(EXPECTED);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

  describe('getProjectRepositories()', () => {
    const REPOSITORIES = require('../fixtures/bitbucket/repositories.json');

    it('should return unauthorized status', (done) => {
      const stub = sinon.stub(BitbucketService, 'getProjectRepositories').resolves(REPOSITORIES);

      request(app)
        .get('/bitbucket/projects/CLOUD/repos')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return 500 status', (done) => {
      const stub = sinon.stub(BitbucketService, 'getProjectRepositories').rejects('error');

      request(app)
        .get('/bitbucket/projects/CLOUD/repos')
        .set('token', token)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then(() => {
          stub.restore();
          done();
        })
        .catch(done);
    });

    it('should return projects', (done) => {
      const stub = sinon.stub(BitbucketService, 'getProjectRepositories').resolves(REPOSITORIES);
      const EXPECTED = {
          size: 4,
          limit: 1000,
          isLastPage: true,
          values: [
            {
              slug: 'apidocex',
              name: 'apiDocEx',
            },
            {
              slug: 'blog',
              name: 'blog',
            },
            {
              slug: 'console-server',
              name: 'console-server',
            },
            {
              slug: 'console-ui',
              name: 'console-ui',
            }
          ]
        }
      ;

      request(app)
        .get('/bitbucket/projects/CLOUD/repos')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(EXPECTED);
          stub.restore();

          done();
        })
        .catch(done);
    });

    it('should return inactive projects', (done) => {
      const stub = sinon.stub(BitbucketService, 'getInactiveProjectRepositories').resolves(REPOSITORIES);

      const EXPECTED = {
          size: 4,
          limit: 1000,
          isLastPage: true,
          values: [
            {
              slug: 'apidocex',
              name: 'apiDocEx',
            },
            {
              slug: 'blog',
              name: 'blog',
            },
            {
              slug: 'console-server',
              name: 'console-server',
            },
            {
              slug: 'console-ui',
              name: 'console-ui',
            }
          ]
        }
      ;

      request(app)
        .get('/bitbucket/projects/CLOUD/repos?inactiveOnly=true')
        .set('token', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.result).to.equal(true);
          expect(res.body.data).to.eql(EXPECTED);
          stub.restore();

          done();
        })
        .catch(done);
    });
  });

});
