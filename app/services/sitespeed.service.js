const Promise = require('bluebird');
const request = require('request-promise');
const cron = require('node-cron');
const moment = require('moment');
const later = require('later');
const util = require('util');
const _ = require('lodash');
const K8SUtils = require('../utils/kubernetes.utils');
const config = require('../../config');
const MINIMUM_INTERVAL = 3; // hours

const S3 = require('aws-sdk/clients/s3');

// K8S
const K8S_BASE_URL = config.sitespeed.k8s.baseUrl;
const K8S_TOKEN = config.sitespeed.k8s.token;
const K8S_NAMESPACE = config.sitespeed.k8s.namespace;

// S3
const S3_BUCKET = config.sitespeed.s3.bucket;
const S3_KEY = config.sitespeed.s3.key;
const S3_SECRET = config.sitespeed.s3.secret;

const s3 = new S3({
  apiVersion: '2006-03-01',
  region: 'us-east-1',
  credentials: {
    accessKeyId: S3_KEY,
    secretAccessKey: S3_SECRET
  }
});

const BASE_S3_PARAMS = {
  Bucket: S3_BUCKET,
  Delimiter: '/',
  Prefix: '',
  MaxKeys: 1000
};

// every args will be holding those commands
const BASE_ARGS = [
  '--graphite.host', 'graphite',
  '--s3.key', S3_KEY,
  '--s3.secret', S3_SECRET,
  '--s3.bucketname', S3_BUCKET,
  '--outputFolder', '$(CRON_NAME)'
];

const API_BETA = '/apis/batch/v1beta1';
const NAMESPACES = '/namespaces';
const CRON_JOBS = '/cronjobs';

/**
 * List SiteSpeed CronJobs
 * GET /sitespeed/cronjobs
 */
exports.listCronJobs = (username) => {
  const URI = util.format('%s%s%s/%s%s', K8S_BASE_URL, API_BETA, NAMESPACES, K8S_NAMESPACE, CRON_JOBS);
  const options = {
    uri: URI,
    auth: {
      bearer: K8S_TOKEN
    },
    strictSSL: false,
    json: true
  };

  return request.get(options)
    .then(response => response.items.map(item => K8SUtils.removeNonUserCronJobArgs(username, item)));
};

/**
 * Get SiteSpeed CronJob
 * GET /sitespeed/cronjobs/:name
 */
exports.getCronJob = (name) => {
  if (!name) {
    return Promise.reject('name is required');
  }

  // get cronjob
  const URI = util.format('%s%s%s/%s%s/%s', K8S_BASE_URL, API_BETA, NAMESPACES, K8S_NAMESPACE, CRON_JOBS, name);
  const options = {
    uri: URI,
    auth: {
      bearer: K8S_TOKEN
    },
    strictSSL: false,
    json: true
  };

  return request.get(options);
};

exports.getCronJobS3Reports = (name) => {
  // add Prefix without modifying BASE_S3_PARAMS
  const params = _.cloneDeep(BASE_S3_PARAMS);
  params.Prefix = name + '/';

  return s3.listObjectsV2(params).promise()
    .then(response => response.CommonPrefixes)
    // sort from newest to oldest
    .then(dates => dates.reverse())
    // map { Prefix: 'www.gmail.com/2017-10-31-13-12-11/' } to `bucketBaseUrl.com/www.gmail.com/2017-10-31-13-12-11/index.html`
    .then(commonPrefixes => commonPrefixes.map(commonPrefix => {
      // remove prefix and all slashes
      const dateParts = commonPrefix.Prefix.replace(name, '').replace(/\//g, '');

      // parse from slash-separated date, already in UTC
      const reportDate = moment.utc(dateParts, 'YYYY-MM-DD-HH-mm-ss');

      // construct reportUrl from prefix
      const reportUrl = `http://${S3_BUCKET}/${commonPrefix.Prefix}index.html`;

      return {
        date: reportDate,
        url: reportUrl
      };
    }));
};

/**
 * Create SiteSpeed CronJob
 * POST /sitespeed/cronjobs
 */
exports.createCronJob = (username, name, schedule, urls, args) => {
  urls = urls || [];
  args = args || [];

  if (!name) {
    return Promise.reject('name is required and should be unique');
  }

  if (!username) {
    return Promise.reject('username is required');
  }

  if (!cron.validate(schedule)) {
    return Promise.reject('Invalid cron schedule');
  }

  if (!isValidCronJobInterval(schedule)) {
    return Promise.reject(`Invalid cron schedule. Minimum interval is ${MINIMUM_INTERVAL} hours`);
  }

  if (urls.length === 0) {
    return Promise.reject('At least one url is required');
  }

  // since urls also go into args, validate them
  if (!isValidArgs(urls) || !isValidArgs(args)) {
    return Promise.reject('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');
  }

  // `-b` and `firefox` as 2 different elements
  if (!isValidArg(urls) || !isValidArg(args)) {
    return Promise.reject('Only one argument per line is permitted');
  }

  const URI = util.format('%s%s%s/%s%s', K8S_BASE_URL, API_BETA, NAMESPACES, K8S_NAMESPACE, CRON_JOBS);
  const ARGS = [...urls, ...BASE_ARGS, ...args];

  const options = {
    uri: URI,
    auth: {
      bearer: K8S_TOKEN
    },
    strictSSL: false,
    json: true,
    body: createCronJobObject(username, name, schedule, urls, ARGS)
  };

  return request.post(options)
    .then(response => K8SUtils.removeNonUserCronJobArgs(username, response));
};

/**
 * Update SiteSpeed CronJob
 * PUT /sitespeed/cronjobs/:name
 */
exports.updateCronJob = (username, name, schedule, urls, args) => {
  urls = urls || [];
  args = args || [];

  if (!name) {
    return Promise.reject('name is required and should be unique');
  }

  if (!username) {
    return Promise.reject('username is required');
  }

  if (!cron.validate(schedule)) {
    return Promise.reject('Invalid cron schedule');
  }

  if (!isValidCronJobInterval(schedule)) {
    return Promise.reject(`Invalid cron schedule. Minimum interval is ${MINIMUM_INTERVAL} hours`);
  }

  if (urls.length === 0) {
    return Promise.reject('At least one url is required');
  }

  // since urls also go into args, validate them
  if (!isValidArgs(urls) || !isValidArgs(args)) {
    return Promise.reject('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');
  }

  // `-b` and `firefox` as 2 different elements
  if (!isValidArg(urls) || !isValidArg(args)) {
    return Promise.reject('Only one argument per line is permitted');
  }

  const URI = util.format('%s%s%s/%s%s/%s', K8S_BASE_URL, API_BETA, NAMESPACES, K8S_NAMESPACE, CRON_JOBS, name);
  const ARGS = [...urls, ...BASE_ARGS, ...args];

  const options = {
    uri: URI,
    auth: {
      bearer: K8S_TOKEN
    },
    strictSSL: false,
    json: true,
    body: createCronJobObject(username, name, schedule, urls, ARGS)
  };

  return request.put(options)
    .then(response => K8SUtils.removeNonUserCronJobArgs(username, response));
};

exports.deleteCronJob = (username, name) => {

  if (!username) {
    return Promise.reject('username is required');
  }

  if (!name) {
    return Promise.reject('name is required');
  }

  // get cronjob
  const URI = util.format('%s%s%s/%s%s/%s', K8S_BASE_URL, API_BETA, NAMESPACES, K8S_NAMESPACE, CRON_JOBS, name);
  const options = {
    uri: URI,
    auth: {
      bearer: K8S_TOKEN
    },
    strictSSL: false,
    json: true
  };

  return request.delete(options)
    .then(response => K8SUtils.removeNonUserCronJobArgs(username, response));
};

const createCronJobObject = (username, name, schedule, urls, ARGS) => {
  return {
    // apiVersion/kind
    apiVersion: 'batch/v1beta1',
    kind: 'CronJob',
    // metadata
    metadata: {
      name,
      namespace: K8S_NAMESPACE,
      labels: {
        run: name
      },
      annotations: {
        username,
        urls: urls.join(',')
      }
    },
    // spec
    spec: {
      concurrencyPolicy: 'Replace',
      startingDeadlineSeconds: config.sitespeed.startingDeadlineSeconds || 300, // defaults to 5 minutes
      successfulJobsHistoryLimit: 5,
      failedJobsHistoryLimit: 5,
      suspend: false,
      schedule,
      jobTemplate: {
        spec: {
          template: {
            metadata: {
              labels: {
                run: name
              }
            },
            spec: {
              dnsPolicy: 'ClusterFirst',
              restartPolicy: 'OnFailure',
              schedulerName: 'default-scheduler',
              securityContext: {},
              terminationGracePeriodSeconds: 30,
              containers: [
                {
                  args: ARGS,
                  env: [
                    {
                      name: 'CRON_NAME',
                      value: name
                    }
                  ],
                  lifecycle: {
                    postStart: {
                      exec: {
                        command: [
                          '/bin/sh',
                          '-c',
                          'cp /tmp/customstorage/index.js /usr/src/app/lib/support/resultsStorage/index.js'
                        ]
                      }
                    }
                  },
                  volumeMounts: [
                    {
                      mountPath: '/tmp/customstorage/',
                      name: 'customstorage'
                    }
                  ],
                  name,
                  image: 'sitespeedio/sitespeed.io:5.6.5',
                  imagePullPolicy: 'Always',
                }
              ],
              volumes: [
                {
                  configMap: {
                    defaultMode: 420,
                    name: 'customstorage'
                  },
                  name: 'customstorage'
                }
              ]
            }
          }
        }
      }
    },
  };
};

const isValidCronJobInterval = (schedule) => {
  const scheduleLength = schedule.split(' ').length;
  const hasSeconds = scheduleLength > 5;

  const laterSchedule = later.parse.cron(schedule, hasSeconds);
  const occurrences = later.schedule(laterSchedule).next(2, new Date());

  const firstOccurrence = moment(occurrences[0]);
  const secondOccurrence = moment(occurrences[1]);
  const minutesInterval = secondOccurrence.diff(firstOccurrence, 'minutes');

  return (minutesInterval / 60) >= MINIMUM_INTERVAL;
};

// blacklist --graphite, --s3 commands
const isValidArgs = (args) => {
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];

    if (arg.startsWith('--graphite.') || arg.startsWith('--s3.') || arg === '--outputFolder') {
      return false;
    }
  }

  // validation passed
  return true;
};

// if the -* or --* argument is followed by a space or arg, return false
// only 1 argument is allowed per args array element
const isValidArg = (args) => {
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];

    if (/^(-|--)\S+\s+.*/.test(arg)) {
      return false;
    }
  }

  // validation passed
  return true;
};
