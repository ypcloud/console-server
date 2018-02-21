const cron = require('node-cron');
const ProjectsService = require('../app/services/projects.service');

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

const MINUTELY_CRON_TAB = '0 * * * * *';   // Every minute
const DAILY_CRON_TAB = '0 0 1 * * *';      // At 01:00, everyday
const WEEKLY_CRON_TAB = '0 0 2 * * 1';     // At 01:00, on Monday
const MONTHLY_CRON_TAB = '0 0 3 1 * *';    // At 03:00, every month on 1st

module.exports = () => {
  cron.schedule(MINUTELY_CRON_TAB, () => {
    console.log('Minutely Cron Started');
    ProjectsService();
  });
};
