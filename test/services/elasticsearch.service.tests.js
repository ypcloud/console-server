const expect = require('expect.js');
const sinon = require('sinon');
const moment = require('moment');
const esHelpers = require('../helpers/es5-fixture');
const ElasticsearchService = require('../../app/services/elasticsearch.service');
const LOGS = require('../fixtures/elasticsearch/logs.json');

describe('Elasticsearch Service tests', () => {
  before((done) => {
    sinon.stub(moment.fn, 'valueOf').returns(0);

    // make sure only the random.json ES fixtures is loaded
    // this simulates the existing data in ES, which should never be tempered
    esHelpers.deleteAll()
      .then(() => esHelpers.getAll())
      .then(apis => {
        expect(apis.length).to.equal(0);
        return esHelpers.loadAll(LOGS);
      })
      .then(() => esHelpers.getAll())
      .then(apis => {
        expect(apis.length).to.equal(10);
        done();
      })
      .catch(done);
  });

  after((done) => {
    moment.fn.valueOf.restore();

    esHelpers.deleteAll()
      .then(() => esHelpers.getAll())
      .then(apis => {
        expect(apis.length).to.equal(0);
        done();
      })
      .catch(done);
  });

  describe('searchByNamespace', () => {
    it('should throw if namespace is missing', (done) => {
      ElasticsearchService.searchByNamespace(null)
        .then(done.fail)
        .catch(error => {
          expect(error.message).to.equal('namespace is required');
          done();
        });
    });

    it('should throw if namespace is *', (done) => {
      ElasticsearchService.searchByNamespace('*')
        .then(done.fail)
        .catch(error => {
          expect(error.message).to.equal('namespace is required');
          done();
        });
    });

    it('should throw if namespace contains *', (done) => {
      ElasticsearchService.searchByNamespace('console-*')
        .then(done.fail)
        .catch(error => {
          expect(error.message).to.equal('namespace is required');
          done();
        });
    });

    it('should return zero results', (done) => {
      ElasticsearchService.searchByNamespace('unknown-namespace')
        .then(logs => {
          expect(logs.length).to.equal(0);
          done();
        })
        .catch(done.fail);
    });

    it('should return 5 logs for console-server', (done) => {
      ElasticsearchService.searchByNamespace('console-server')
        .then(logs => {
          expect(logs.length).to.equal(5);
          done();
        })
        .catch(done.fail);
    });

    it('should return 2 logs for console-server-develop', (done) => {
      ElasticsearchService.searchByNamespace('console-server-develop')
        .then(logs => {
          expect(logs.length).to.equal(2);
          done();
        })
        .catch(done.fail);
    });

    it('should return 3 logs for console-server-qa', (done) => {
      ElasticsearchService.searchByNamespace('console-server-qa')
        .then(logs => {
          expect(logs.length).to.equal(3);
          done();
        })
        .catch(done.fail);
    });

    it('should return 0 logs for console-server, with unmatched searchTexts', (done) => {
      ElasticsearchService.searchByNamespace('console-server', 'some random text')
        .then(logs => {
          expect(logs.length).to.equal(0);
          done();
        })
        .catch(done.fail);
    });

    it('should return 5 logs for console-server, with text matching all', (done) => {
      ElasticsearchService.searchByNamespace('console-server', 'Log #')
        .then(logs => {
          expect(logs.length).to.equal(5);
          done();
        })
        .catch(done.fail);
    });

    it('should return 1 logs for console-server, with Log one', (done) => {
      ElasticsearchService.searchByNamespace('console-server', 'Log, one')
        .then(logs => {
          expect(logs.length).to.equal(1);
          done();
        })
        .catch(done.fail);
    });

    it('should return 2 logs for console-server, with Log t', (done) => {
      ElasticsearchService.searchByNamespace('console-server', 'Log, t')
        .then(logs => {
          expect(logs.length).to.equal(2);
          done();
        })
        .catch(done.fail);
    });

    it('should return 2 logs for console-server-qa, with Log t', (done) => {
      ElasticsearchService.searchByNamespace('console-server-qa', 'Log, t')
        .then(logs => {
          expect(logs.length).to.equal(2);
          done();
        })
        .catch(done.fail);
    });

    it('should throw if rangeType is missing and timestamp provided', (done) => {
      const timestamp = new Date(Date.UTC(2017, 10, 20)).getTime(); // 0-based

      ElasticsearchService.searchByNamespace('console-server', 'Log', timestamp)
        .then(done.fail)
        .catch(error => {
          expect(error.message).to.equal('rangeType (lte|gte) is required when timestamp is provided');
          done();
        });
    });

    it('should throw if rangeType is invalid', (done) => {
      const timestamp = new Date(Date.UTC(2017, 10, 20)).getTime(); // 0-based

      ElasticsearchService.searchByNamespace('console-server', 'Log', timestamp, 'greater')
        .then(done.fail)
        .catch(error => {
          expect(error.message).to.equal('Invalid rangeType, only lte|gte are allowed');
          done();
        });
    });

    it('should return 1 logs for console-server, with Log, timestamp, lte', (done) => {
      const timestamp = new Date(Date.UTC(2017, 10, 20)).getTime(); // 0-based

      ElasticsearchService.searchByNamespace('console-server', 'Log', timestamp, 'lte')
        .then(logs => {
          expect(logs.length).to.equal(1);
          done();
        })
        .catch(done.fail);
    });

    it('should return 5 logs for console-server, with Log, timestamp, gte', (done) => {
      const timestamp = new Date(Date.UTC(2017, 10, 20)).getTime(); // 0-based

      ElasticsearchService.searchByNamespace('console-server', 'Log', timestamp, 'gte')
        .then(logs => {
          expect(logs.length).to.equal(5);
          done();
        })
        .catch(done.fail);
    });

    it('should return 3 logs for console-server, with Log, timestamp, gte, upper/loserBoundTimestamp', (done) => {
      const timestamp = new Date('2017-11-21T00:00:00.000Z').getTime();
      const lowerBoundTimestamp = new Date('2017-11-21T00:00:00.000Z').getTime();
      const upperBoundTimestamp = new Date('2017-11-23T00:00:00.000Z').getTime();

      ElasticsearchService.searchByNamespace('console-server', 'Log', timestamp, 'gte', 'desc', lowerBoundTimestamp, upperBoundTimestamp)
        .then(logs => {
          expect(logs.length).to.equal(3);
          expect(logs.map(l => l._source.message)).to.eql(['Log four', 'Log three', 'Log two']);

          done();
        })
        .catch(done.fail);
    });
  });
});
