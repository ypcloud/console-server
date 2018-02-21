const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const EventsService = require('../../app/services/events.service');
const config = require('../../config/index');

describe('Events Service tests', function () {
  let requestPost;

  const BASE_URL = config.pubsub.baseUrl;
  const KEY = config.pubsub.key;

  beforeEach(function () {
    requestPost = sinon.stub(request, 'post').resolves({});
  });

  afterEach(function () {
    request.post.restore();
  });

  describe('publish()', function () {
    it('should call correct endpoint for getEvents', function (done) {
      const EVENT = {
        who: 'Mark Massoud',
        what: 'console-server-81070613',
        where: 'console',
        timestamp: '2017-09-12T17:19:45.344Z',
        namespace: 'console-develop',
        source: 'console',
        type: 'terminated',
        description: 'Mark Massoud terminated a pod on namespace console-develop'
      };

      EventsService.publish(EVENT)
        .then(() => {
          expect(requestPost.getCall(0).args[0].uri).to.equal(BASE_URL);
          expect(requestPost.getCall(0).args[0].body).to.eql(EVENT);
          expect(requestPost.getCall(0).args[0].json).to.eql(true);
          expect(requestPost.getCall(0).args[0].qs).to.eql({ key: KEY });

          done();
        })
        .catch(done);
    });
  });

});
