const cron = require('node-cron');
const KubernetesService = require('../app/services/kubernetes.service');
const MetricsService = require('../app/services/metrics.service');
const DroneService = require('../app/services/drone.service');
const UserModel = require('../app/models/user.model');
const config = require('../config');

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

const DEPLOYMENTS_OFFSET = config.kubernetes.deploymentsCountAdjustment;

if (DEPLOYMENTS_OFFSET) {
  console.log('Deployments count adjustment is set with', DEPLOYMENTS_OFFSET);
}

module.exports = () => {
  cron.schedule(DAILY_CRON_TAB, () => {
    console.log('Count Deployments\' Revisions Cron Job triggered!');

    KubernetesService.countDeploymentsByCluster('aws')
      .then(count => MetricsService.saveMetricDaily('deployments', (count + +DEPLOYMENTS_OFFSET)))
      .catch(console.error)
      .then(() => {
        console.log('Count Pods Cron Job triggered!');
        return KubernetesService.getClusters();
      })
      .map(cluster => {
        return KubernetesService.countPodsByCluster(cluster)
          .then(count => MetricsService.saveMetricDaily(`pods_${cluster}`, count));
      })
      .catch(console.error)
      .then(() => {
        console.log('Count Drone Contributors Cron Job triggered!');
        return DroneService.countUsers();
      })
      .then(count => MetricsService.saveMetricDaily('developers', count))
      .catch(console.error)
      .then(() => {
        console.log('Count Users Cron Job triggered!');
        return UserModel.count();
      })
      .then(count => MetricsService.saveMetricDaily('users', count))
      .catch(console.error);
  });
};
