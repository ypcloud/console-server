const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const AlertsService = require('../../app/services/alerts.service');

describe('Alerts Service tests', () => {

  describe('getAlerts()', () => {
    it('should call correct endpoint for getNews', () => {
      AlertsService.getAlerts()
        .then(alerts => {
          expect(alerts).to.eql([
            {
              message: 'Alert 1',
              type: 'info',
              isActive: true
            }
          ]);
        });
    });
  });

});
