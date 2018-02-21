const cron = require('node-cron');
const APICatalogService = require('../app/services/api-catalog.service');

/**
 # ┌────────────── second
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
 */

const HOURLY_CRON_TAB = '0 * * * *';

module.exports = () => {
  cron.schedule(HOURLY_CRON_TAB, () => {
    console.log('Hourly Cron Started');
    console.log('API Catalog Cron Job triggered!');

    APICatalogService.writeApiEntries()
      .then(() => console.log('API Catalog Cron Job successfully finished.'))
      .catch(() => console.log('An error occurred during the API Catalog Cron Job.'));
  });
};
