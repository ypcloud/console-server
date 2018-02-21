const expect = require('expect.js');
const sinon = require('sinon');
const _ = require('lodash');
const esHelpers = require('../helpers/es2-fixture');
const KubernetesService = require('../../app/services/kubernetes.service');
const SwaggerService = require('../../app/services/swagger.service');
const APICatalogService = require('../../app/services/api-catalog.service');
const NAMESPACES = require('../fixtures/kubernetes/namespaces.json');
const SWAGGER_JSON = require('../fixtures/swagger/swagger.json');

describe('API Catalog Service tests', () => {
  let getNamespacesStub;
  let getNamespaceIngressesStub;
  let getSwaggerFileStub;

  const ingressLabelsGroupgithub = {
    'codekube.io/service.name': 'quotes',
    'codekube.io/service.version': '2.0',
    'codekube.io/service.group': 'github',
    'codekube.io/service.env': 'local'
  };

  const ingressLabelsGroupCLOUD = {
    'codekube.io/service.name': 'uptimes',
    'codekube.io/service.version': '3.0',
    'codekube.io/service.group': 'cloud',
    'codekube.io/service.env': 'prod'
  };

  beforeEach((done) => {
    // stub services
    // call index 5 (6th) call is with namespace `otherNamespaceName-qa`, which was already added in random.json es fixtures, thus should be deleted
    getSwaggerFileStub = sinon.stub(SwaggerService, 'getSwaggerFile');
    getSwaggerFileStub.resolves(SWAGGER_JSON);
    getSwaggerFileStub.onCall(5).rejects('error');

    // on call 0,1,2,3 only
    getNamespaceIngressesStub = sinon.stub(KubernetesService, 'getAllNamespaceIngressesServiceLabels');
    getNamespaceIngressesStub.onCall(0).resolves(ingressLabelsGroupgithub);
    getNamespaceIngressesStub.onCall(1).resolves(ingressLabelsGroupCLOUD);
    getNamespaceIngressesStub.onCall(2).resolves(ingressLabelsGroupCLOUD);
    getNamespaceIngressesStub.rejects('error');

    getNamespacesStub = sinon.stub(KubernetesService, 'getNamespaces').resolves(NAMESPACES.items);

    // make sure only the random.json ES fixtures is loaded
    // this simulates the existing data in ES, which should never be tempered
    esHelpers.deleteAll()
      .then(() => esHelpers.getAll())
      .then(apis => {
        expect(apis.length).to.equal(0);
        return esHelpers.loadAll();
      })
      .then(() => esHelpers.getAll())
      .then(apis => {
        expect(apis.length).to.equal(4);
        done();
      })
      .catch(done);
  });

  afterEach((done) => {
    // restore all stubs
    getNamespacesStub.restore();
    getNamespaceIngressesStub.restore();
    getSwaggerFileStub.restore();

    esHelpers.deleteAll()
      .then(() => esHelpers.getAll())
      .then(apis => {
        expect(apis.length).to.equal(0);
        done();
      })
      .catch(done);
  });

  describe('writeApiEntries', () => {
    it('should create correct Swagger ES entries, and delete outdated ones', (done) => {
      APICatalogService.writeApiEntries()
        .then(() => {
          setTimeout(() => {
            // after 1 second, get all
            esHelpers.getAll()
              .then(apis => {
                expect(getNamespacesStub.callCount).to.equal(1);
                expect(getNamespaceIngressesStub.callCount).to.equal(6);
                expect(getSwaggerFileStub.callCount).to.equal(6);

                // 4 in random.json, + 6 namespaces Swagger files
                // but 1 Swagger failed to fetch, which was already
                // present in ES, so it got deleted, thus 8 in total
                expect(apis.length).to.equal(8);
              })
              .then(() => APICatalogService.searchAPICatalog())
              .then(catalogApis => {
                // only 5/8 are actual API Catalog apis
                expect(catalogApis.length).to.equal(5);

                // TODO: When !serviceGroup, namespace is not taken into account for sorting. Use _script?
                // REAL EXPECTED: namespaceName-develop', 'namespaceName-qa', 'namespaceName', 'otherNamespaceName', 'otherNamespaceName-develop'
                // should be sorted by serviceGroup, serviceName, namespace
                expect(catalogApis.map(api => api.namespace)).to.eql([
                  'namespaceName-develop',
                  'namespaceName-qa',
                  'namespaceName',
                  'otherNamespaceName-develop',
                  'otherNamespaceName'
                ]);

                // let's test dev-only catalog
                return APICatalogService.searchAPICatalog('dev');
              })
              .then(catalogApis => {
                // only 2 are dev API Catalog apis
                expect(catalogApis.length).to.equal(2);

                // let's test if we returned are the fields we need
                const namespaceNameDevelopApi = _.find(catalogApis, { namespace: 'namespaceName-develop' });
                const otherNamespaceNameDevelopApi = _.find(catalogApis, { namespace: 'otherNamespaceName-develop' });

                expect(namespaceNameDevelopApi).to.eql({
                  repo: {
                    owner: 'owner1',
                    name: 'repo2'
                  },
                  info: {
                    title: 'Swagger Petstore',
                    description: 'This is a sample server Petstore server.',
                  },
                  namespace: 'namespaceName-develop',
                  serviceName: 'uptimes',
                  serviceGroup: 'cloud'
                });

                expect(otherNamespaceNameDevelopApi).to.eql({
                  repo: {
                    owner: 'owner2',
                    name: 'repo2'
                  },
                  info: {
                    title: 'Swagger Petstore',
                    description: 'This is a sample server Petstore server.',
                  },
                  namespace: 'otherNamespaceName-develop'
                });

                return APICatalogService.searchAPICatalog('qa');
              })
              .then(catalogApis => {
                // only 1 are qa API Catalog apis (other qa failed to fetch Swagger), remember?
                expect(catalogApis.length).to.equal(1);

                const namespaceNameQAApi = _.find(catalogApis, { namespace: 'namespaceName-qa' });

                expect(namespaceNameQAApi).to.eql({
                  repo: {
                    owner: 'owner1',
                    name: 'repo3'
                  },
                  info: {
                    title: 'Swagger Petstore',
                    description: 'This is a sample server Petstore server.',
                  },
                  namespace: 'namespaceName-qa',
                  serviceName: 'uptimes',
                  serviceGroup: 'cloud'
                });

                return APICatalogService.searchAPICatalog('prod');
              })
              .then(catalogApis => {
                // only 2 are prod API Catalog apis
                expect(catalogApis.length).to.equal(2);

                const namespaceNameProdApi = _.find(catalogApis, { namespace: 'namespaceName' });
                const otherNamespaceNameProdApi = _.find(catalogApis, { namespace: 'otherNamespaceName' });

                expect(namespaceNameProdApi).to.eql({
                  repo: {
                    owner: 'owner1',
                    name: 'repo1'
                  },
                  info: {
                    title: 'Swagger Petstore',
                    description: 'This is a sample server Petstore server.',
                  },
                  namespace: 'namespaceName',
                  serviceName: 'quotes',
                  serviceGroup: 'github'
                });

                expect(otherNamespaceNameProdApi).to.eql({
                  repo: {
                    owner: 'owner2',
                    name: 'repo1'
                  },
                  info: {
                    title: 'Swagger Petstore',
                    description: 'This is a sample server Petstore server.',
                  },
                  namespace: 'otherNamespaceName'
                });

                // all is well :)
                done();
              })
              .catch(done);
          }, 1000);
        })
        .catch(done);
    }).timeout(5000); // we need more time because of the setTimeouts
  });

  describe('searchAPICatalog', () => {
    it('should properly search in all fields', (done) => {
      APICatalogService.writeApiEntries()
        .then(() => {
          setTimeout(() => {
            // after 1 second, get all
            esHelpers.getAll()
              .then(apis => {
                expect(getNamespacesStub.callCount).to.equal(1);
                expect(getNamespaceIngressesStub.callCount).to.equal(6);
                expect(getSwaggerFileStub.callCount).to.equal(6);

                // 4 in random.json, + 6 namespaces Swagger files
                // but 1 Swagger failed to fetch, which was already
                // present in ES, so it got deleted, thus 8 in total
                expect(apis.length).to.equal(8);
              })
              .then(() => APICatalogService.searchAPICatalog('*'))
              .then(catalogApis => {
                // only 5/8 are actual API Catalog apis
                expect(catalogApis.length).to.equal(5);

                // let's test dev-only catalog
                return APICatalogService.searchAPICatalog('dev');
              })
              .then(catalogApis => {
                // only 2 are dev API Catalog apis
                expect(catalogApis.length).to.equal(2);

                // let's test qa-only catalog
                return APICatalogService.searchAPICatalog('qa');
              })
              .then(catalogApis => {
                // only 1 are qa API Catalog apis (other qa failed to fetch Swagger), remember?
                expect(catalogApis.length).to.equal(1);

                // let's test prod-only catalog
                return APICatalogService.searchAPICatalog('prod');
              })
              .then(catalogApis => {
                // only 2 are prod API Catalog apis
                expect(catalogApis.length).to.equal(2);

                // now let's test the same using namespaceName, in dev
                return APICatalogService.searchAPICatalog('dev', null, 'amespaceNam');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(2);

                // now let's test the same using serviceGroup, in dev
                return APICatalogService.searchAPICatalog('dev', null, 'is IS a Sample SERVER Petstore');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(2);

                // now let's test the same using repo2, in dev
                return APICatalogService.searchAPICatalog('dev', null, 'EPO2');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(2);

                // now let's test the same using therNamespace, spec, dev (in namespaceName-develop) in * environments
                return APICatalogService.searchAPICatalog('*', null, 'therNamespaceName, PETStore  , evelo');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(1);

                // now let's search with serviceGroup CLOUD
                return APICatalogService.searchAPICatalog('*', 'ClOuD');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(2);

                // now let's search with serviceGroup github
                return APICatalogService.searchAPICatalog('*', 'github');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(1);

                // now let's search with a substring serviceGroup (should not work)
                return APICatalogService.searchAPICatalog('*', 'CLO');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(0);

                // now let's search with an unknown serviceGroup
                return APICatalogService.searchAPICatalog('*', 'iAmUnknowngithubClOuDServiceGroup');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(0);

                // now let's search with a combination of serviceGroup/searchTerms
                return APICatalogService.searchAPICatalog('*', 'ClOuD', 'namespaceName, repo2');
              })
              .then(catalogApis => {
                expect(catalogApis.length).to.equal(1);

                // all is well :)
                done();
              })
              .catch(done);
          }, 1000);
        })
        .catch(done);
    }).timeout(5000); // we need more time because of the setTimeouts
  });

  describe('getServiceGroups', () => {
    it('should return all serviceGroups, without null ones', (done) => {
      APICatalogService.writeApiEntries()
        .then(() => {
          setTimeout(() => {
            // after 1 second, get serviceGroups
            APICatalogService.getServiceGroups()
              .then(serviceGroups => {
                expect(serviceGroups).to.eql(
                  {
                    total: 5,
                    serviceGroups: [
                      {
                        key: 'cloud',
                        doc_count: 2
                      },
                      {
                        key: 'github',
                        doc_count: 1
                      }
                    ]
                  });
                done();
              })
              .catch(done);
          }, 1000);
        });
    }).timeout(5000); // we need more time because of the setTimeouts
  });
});
