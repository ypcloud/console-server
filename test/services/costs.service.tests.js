const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const CostsService = require('../../app/services/costs.service');

describe('Costs Service tests', () => {

  describe('getCosts()', () => {
    it('should return all costs', (done) => {
      CostsService.getCosts()
        .then(costs => {
          expect(costs).to.eql({
            clusters: {
              aws: {
                '2017/09': '10000',
                '2017/10': '15000'
              },
              gce: {
                '2017/09': '11000',
                '2017/10': '16000'
              },
              monthlyMax: 20000
            },
            databases: {
              mongo: {
                '2017/09': '10000',
                '2017/10': '15000'
              },
              mysql: {
                '2017/09': '10000',
                '2017/10': '15000'
              }
            }
          });

          done();
        })
        .catch(done);
    });

    it('should return component\'s costs', (done) => {
      CostsService.getCosts('clusters')
        .then(costs => {
          expect(costs).to.eql({
            clusters: {
              aws: {
                '2017/09': '10000',
                '2017/10': '15000'
              },
              gce: {
                '2017/09': '11000',
                '2017/10': '16000'
              },
              monthlyMax: 20000
            }
          });

          done();
        })
        .catch(done);
    });
  });

});
