const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const { afterEach, beforeEach } = require('mocha');
const expect = require('expect.js');
const sinon = require('sinon');
const request = require('request-promise');
const _ = require('lodash');
const AWS = require('aws-sdk');
const SiteSpeedService = require('../../app/services/sitespeed.service');
const config = require('../../config/index');
const cronjobs = require('../fixtures/kubernetes/cronjobs.json');

describe('SiteSpeed Service tests', function () {
  let requestGet;
  let requestPut;
  let requestPost;
  let requestDelete;

  const K8S_BASE_URL = config.sitespeed.k8s.baseUrl;
  const K8S_TOKEN = config.sitespeed.k8s.token;
  const K8S_NAMESPACE = config.sitespeed.k8s.namespace;

  beforeEach(() => {
    requestGet = sinon.stub(request, 'get').resolves(_.cloneDeep(cronjobs));
    requestPut = sinon.stub(request, 'put').resolves(_.cloneDeep(cronjobs.items[0]));
    requestPost = sinon.stub(request, 'post').resolves(_.cloneDeep(cronjobs.items[0]));
    requestDelete = sinon.stub(request, 'delete').resolves(_.cloneDeep(cronjobs.items[0]));
  });

  afterEach(() => {
    request.get.restore();
    request.put.restore();
    request.post.restore();
    request.delete.restore();
  });

  describe('listCronJobs()', () => {
    it('should call correct endpoint', (done) => {
      SiteSpeedService.listCronJobs('markmssd')
        .then(() => {
          expect(requestGet.getCall(0).args[0].uri).to.equal(K8S_BASE_URL + `/apis/batch/v1beta1/namespaces/${K8S_NAMESPACE}/cronjobs`);
          expect(requestGet.getCall(0).args[0].auth).to.eql({ bearer: K8S_TOKEN });
          expect(requestGet.getCall(0).args[0].strictSSL).to.equal(false);
          expect(requestGet.getCall(0).args[0].json).to.equal(true);

          done();
        })
        .catch(done);
    });
  });

  describe('createCronJob()', () => {
    it('should throw if name is missing', (done) => {
      const req = {
        name: null,
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('name is required and should be unique');

          done();
        });
    });

    it('should throw if username is missing', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: null,
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('username is required');

          done();
        });
    });

    it('should throw if cron schedule is null', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: null,
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule');

          done();
        });
    });

    it('should throw if urls is null/empty', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 0/3 * * *',
        urls: [],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('At least one url is required');

          done();
        });
    });

    it('should throw if cron schedule is invalid, missing a *', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '* * 3 *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule');

          done();
        });
    });

    it('should throw if cron schedule is less than minimum interval, every seconds', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '* * * * * *', // every second
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule. Minimum interval is 3 hours');

          done();
        });
    });

    it('should throw if cron schedule is less than minimum interval, every minute', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '* * * * *', // every minute
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule. Minimum interval is 3 hours');

          done();
        });
    });

    it('should throw if cron schedule is less than minimum interval, every 2 hours', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 0/2 * * *', // every 2 hours
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule. Minimum interval is 3 hours');

          done();
        });
    });

    it('should throw if space after `-b firefox` as 1 element', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b firefox'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Only one argument per line is permitted');

          done();
        });
    });

    it('should throw if space after `-b `', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b ',
          'firefox'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Only one argument per line is permitted');

          done();
        });
    });

    it('should throw if `-b firefox` as one element in urls', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/',
          '-b firefox'
        ],
        args: [
          '-b',
          'firefox'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Only one argument per line is permitted');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--graphite." in urls', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/',
          '--graphite.port',
          3000
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--graphite."', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--graphite.port',
          3000
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--s3."', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--s3.path',
          'results'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--outputFolder."', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--outputFolder',
          'results'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should call correct endpoint passed null args', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: null
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => {
          expect(requestPost.getCall(0).args[0].uri).to.equal(K8S_BASE_URL + `/apis/batch/v1beta1/namespaces/${K8S_NAMESPACE}/cronjobs`);
          expect(requestPost.getCall(0).args[0].auth).to.eql({ bearer: K8S_TOKEN });
          expect(requestPost.getCall(0).args[0].strictSSL).to.equal(false);
          expect(requestPost.getCall(0).args[0].json).to.equal(true);
          expect(requestPost.getCall(0).args[0].body).to.eql({
            // apiVersion/kind
            apiVersion: 'batch/v1beta1',
            kind: 'CronJob',
            // metadata
            metadata: {
              name: 'Cron Job Name',
              namespace: K8S_NAMESPACE,
              labels: {
                run: 'Cron Job Name'
              },
              annotations: {
                username: 'markmssd',
                urls: 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            // spec
            spec: {
              concurrencyPolicy: 'Replace',
              startingDeadlineSeconds: 120,
              successfulJobsHistoryLimit: 5,
              failedJobsHistoryLimit: 5,
              suspend: false,
              schedule: '0 */3 * * *',
              jobTemplate: {
                spec: {
                  template: {
                    metadata: {
                      labels: {
                        run: 'Cron Job Name'
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
                          args: [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '--graphite.host',
                            'graphite',
                            '--s3.key',
                            'SITESPEED_S3_KEY',
                            '--s3.secret',
                            'SITESPEED_S3_SECRET',
                            '--s3.bucketname',
                            'SITESPEED_S3_BUCKET',
                            '--outputFolder',
                            '$(CRON_NAME)'
                          ],
                          env: [
                            {
                              name: 'CRON_NAME',
                              value: 'Cron Job Name'
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
                          name: 'Cron Job Name',
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
          });

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome',
          '--speedIndex',
          '--html.showAllWaterfallSummary'
        ]
      };

      SiteSpeedService.createCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then((cronjob) => {
          expect(requestPost.getCall(0).args[0].uri).to.equal(K8S_BASE_URL + `/apis/batch/v1beta1/namespaces/${K8S_NAMESPACE}/cronjobs`);
          expect(requestPost.getCall(0).args[0].auth).to.eql({ bearer: K8S_TOKEN });
          expect(requestPost.getCall(0).args[0].strictSSL).to.equal(false);
          expect(requestPost.getCall(0).args[0].json).to.equal(true);
          expect(requestPost.getCall(0).args[0].body).to.eql({
            // apiVersion/kind
            apiVersion: 'batch/v1beta1',
            kind: 'CronJob',
            // metadata
            metadata: {
              name: 'Cron Job Name',
              namespace: K8S_NAMESPACE,
              labels: {
                run: 'Cron Job Name'
              },
              annotations: {
                username: 'markmssd',
                urls: 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            // spec
            spec: {
              concurrencyPolicy: 'Replace',
              startingDeadlineSeconds: 120,
              successfulJobsHistoryLimit: 5,
              failedJobsHistoryLimit: 5,
              suspend: false,
              schedule: '0 */3 * * *',
              jobTemplate: {
                spec: {
                  template: {
                    metadata: {
                      labels: {
                        run: 'Cron Job Name'
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
                          args: [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '--graphite.host',
                            'graphite',
                            '--s3.key',
                            'SITESPEED_S3_KEY',
                            '--s3.secret',
                            'SITESPEED_S3_SECRET',
                            '--s3.bucketname',
                            'SITESPEED_S3_BUCKET',
                            '--outputFolder',
                            '$(CRON_NAME)',
                            '-b',
                            'chrome',
                            '--speedIndex',
                            '--html.showAllWaterfallSummary'
                          ],
                          env: [
                            {
                              name: 'CRON_NAME',
                              value: 'Cron Job Name'
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
                          name: 'Cron Job Name',
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
          });

          // graphite/secrets are gone
          expect(cronjob).to.eql({
            'metadata': {
              'name': 'speed-codekube-ca',
              'namespace': 'sitespeed',
              'selfLink': '/apis/batch/v1beta1/namespaces/sitespeed/cronjobs/speed-codekube-ca',
              'uid': 'd3b0ed6d-af82-11e7-ab9c-42010af000ee',
              'resourceVersion': '561035',
              'creationTimestamp': '2017-10-12T19:23:29Z',
              'labels': {
                'run': 'speed-codekube-ca'
              },
              'annotations': {
                'username': 'markmssd',
                'urls': 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            'spec': {
              'schedule': '0/60 * * * ?',
              'concurrencyPolicy': 'Replace',
              'successfulJobsHistoryLimit': 5,
              'failedJobsHistoryLimit': 5,
              'suspend': false,
              'jobTemplate': {
                'metadata': {
                  'creationTimestamp': null
                },
                'spec': {
                  'template': {
                    'metadata': {
                      'creationTimestamp': null,
                      'labels': {
                        'run': 'speed-codekube-ca'
                      }
                    },
                    'spec': {
                      'containers': [
                        {
                          'name': 'speed-codekube-ca',
                          'image': 'sitespeedio/sitespeed.io:5.6.5',
                          'args': [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '-b',
                            'chrome',
                            '--speedIndex',
                            '--html.showAllWaterfallSummary',
                            '--gpsi.key',
                            'GPSI_KEY',
                          ],
                          'env': [
                            {
                              'name': 'CRON_NAME',
                              'value': 'speed-github-com'
                            }
                          ],
                          'lifecycle': {
                            'postStart': {
                              'exec': {
                                'command': [
                                  '/bin/sh',
                                  '-c',
                                  'cp /tmp/customstorage/index.js /usr/src/app/lib/support/resultsStorage/index.js'
                                ]
                              }
                            }
                          },
                          'volumeMounts': [
                            {
                              'mountPath': '/tmp/customstorage/',
                              'name': 'customstorage'
                            }
                          ],
                          'resources': {},
                          'terminationMessagePath': '/dev/termination-log',
                          'terminationMessagePolicy': 'File',
                          'imagePullPolicy': 'Always'
                        }
                      ],
                      'volumes': [
                        {
                          'configMap': {
                            'defaultMode': 420,
                            'name': 'customstorage'
                          },
                          'name': 'customstorage'
                        }
                      ],
                      'restartPolicy': 'OnFailure',
                      'terminationGracePeriodSeconds': 30,
                      'dnsPolicy': 'ClusterFirst',
                      'securityContext': {},
                      'schedulerName': 'default-scheduler'
                    }
                  }
                }
              }
            },
            'status': {
              'lastScheduleTime': '2017-10-17T17:00:00Z'
            }
          });

          done();
        })
        .catch(done);
    });
  });

  describe('updateCronJob()', () => {
    it('should throw if name is missing', (done) => {
      const req = {
        name: null,
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('name is required and should be unique');

          done();
        });
    });

    it('should throw if username is missing', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: null,
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('username is required');

          done();
        });
    });

    it('should throw if cron schedule is null', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: null,
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule');

          done();
        });
    });

    it('should throw if cron schedule is less than minimum interval, every seconds', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '* * * * * *', // every second
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule. Minimum interval is 3 hours');

          done();
        });
    });

    it('should throw if cron schedule is less than minimum interval, every minute', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '* * * * *', // every minute
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule. Minimum interval is 3 hours');

          done();
        });
    });

    it('should throw if cron schedule is less than minimum interval, every 2 hours', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 0/2 * * *', // every 2 hours
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule. Minimum interval is 3 hours');

          done();
        });
    });

    it('should throw if urls is null/empty', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 0/3 * * *',
        urls: [],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('At least one url is required');

          done();
        });
    });

    it('should throw if cron schedule is invalid, missing a *', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '* * 3 *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Invalid cron schedule');

          done();
        });
    });

    it('should throw if space after `-b firefox` as 1 element', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--browsertime.browser firefox'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Only one argument per line is permitted');

          done();
        });
    });

    it('should throw if space after `-b `', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b ',
          'firefox'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Only one argument per line is permitted');

          done();
        });
    });

    it('should throw if `-b firefox` as one element in urls', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/',
          '-b firefox'
        ],
        args: [
          '-b',
          'firefox'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPost.called).to.be(false);
          expect(error).to.equal('Only one argument per line is permitted');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--graphite." in urls', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/',
          '--graphite.port',
          3000
        ],
        args: [
          '-b',
          'chrome'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--graphite."', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--graphite.port',
          3000
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--s3."', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--s3.path',
          'results'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should throw if passed blacklisted arg "--outputFolder."', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '--outputFolder',
          'results'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestPut.called).to.be(false);
          expect(error).to.equal('Args can not start with "--graphite." or "--s3.", or be "--outputFolder"');

          done();
        });
    });

    it('should call correct endpoint passed null args', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: null
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then(() => {
          expect(requestPut.getCall(0).args[0].uri).to.equal(K8S_BASE_URL + `/apis/batch/v1beta1/namespaces/${K8S_NAMESPACE}/cronjobs/${req.name}`);
          expect(requestPut.getCall(0).args[0].auth).to.eql({ bearer: K8S_TOKEN });
          expect(requestPut.getCall(0).args[0].strictSSL).to.equal(false);
          expect(requestPut.getCall(0).args[0].json).to.equal(true);
          expect(requestPut.getCall(0).args[0].body).to.eql({
            // apiVersion/kind
            apiVersion: 'batch/v1beta1',
            kind: 'CronJob',
            // metadata
            metadata: {
              name: 'Cron Job Name',
              namespace: K8S_NAMESPACE,
              labels: {
                run: 'Cron Job Name'
              },
              annotations: {
                username: 'markmssd',
                urls: 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            // spec
            spec: {
              concurrencyPolicy: 'Replace',
              startingDeadlineSeconds: 120,
              successfulJobsHistoryLimit: 5,
              failedJobsHistoryLimit: 5,
              suspend: false,
              schedule: '0 */3 * * *',
              jobTemplate: {
                spec: {
                  template: {
                    metadata: {
                      labels: {
                        run: 'Cron Job Name'
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
                          args: [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '--graphite.host',
                            'graphite',
                            '--s3.key',
                            'SITESPEED_S3_KEY',
                            '--s3.secret',
                            'SITESPEED_S3_SECRET',
                            '--s3.bucketname',
                            'SITESPEED_S3_BUCKET',
                            '--outputFolder',
                            '$(CRON_NAME)'
                          ],
                          env: [
                            {
                              name: 'CRON_NAME',
                              value: 'Cron Job Name'
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
                          name: 'Cron Job Name',
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
          });

          done();
        })
        .catch(done);
    });

    it('should call correct endpoint', (done) => {
      const req = {
        name: 'Cron Job Name',
        username: 'markmssd',
        schedule: '0 */3 * * *',
        urls: [
          'https://www.yellowpages.ca/',
          'https://preprod-ui.yellowpages.ca/',
          'https://qa-ui-mtl.yellowpages.ca/'
        ],
        args: [
          '-b',
          'chrome',
          '--speedIndex',
          '--html.showAllWaterfallSummary'
        ]
      };

      SiteSpeedService.updateCronJob(req.username, req.name, req.schedule, req.urls, req.args)
        .then((cronjob) => {
          expect(requestPut.getCall(0).args[0].uri).to.equal(K8S_BASE_URL + `/apis/batch/v1beta1/namespaces/${K8S_NAMESPACE}/cronjobs/${req.name}`);
          expect(requestPut.getCall(0).args[0].auth).to.eql({ bearer: K8S_TOKEN });
          expect(requestPut.getCall(0).args[0].strictSSL).to.equal(false);
          expect(requestPut.getCall(0).args[0].json).to.equal(true);
          expect(requestPut.getCall(0).args[0].body).to.eql({
            // apiVersion/kind
            apiVersion: 'batch/v1beta1',
            kind: 'CronJob',
            // metadata
            metadata: {
              name: 'Cron Job Name',
              namespace: K8S_NAMESPACE,
              labels: {
                run: 'Cron Job Name'
              },
              annotations: {
                username: 'markmssd',
                urls: 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            // spec
            spec: {
              concurrencyPolicy: 'Replace',
              startingDeadlineSeconds: 120,
              successfulJobsHistoryLimit: 5,
              failedJobsHistoryLimit: 5,
              suspend: false,
              schedule: '0 */3 * * *',
              jobTemplate: {
                spec: {
                  template: {
                    metadata: {
                      labels: {
                        run: 'Cron Job Name'
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
                          args: [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '--graphite.host',
                            'graphite',
                            '--s3.key',
                            'SITESPEED_S3_KEY',
                            '--s3.secret',
                            'SITESPEED_S3_SECRET',
                            '--s3.bucketname',
                            'SITESPEED_S3_BUCKET',
                            '--outputFolder',
                            '$(CRON_NAME)',
                            '-b',
                            'chrome',
                            '--speedIndex',
                            '--html.showAllWaterfallSummary'
                          ],
                          env: [
                            {
                              name: 'CRON_NAME',
                              value: 'Cron Job Name'
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
                          name: 'Cron Job Name',
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
                      ],
                    }
                  }
                }
              }
            },
          });

          // graphite/secrets are gone
          expect(cronjob).to.eql({
            'metadata': {
              'name': 'speed-codekube-ca',
              'namespace': 'sitespeed',
              'selfLink': '/apis/batch/v1beta1/namespaces/sitespeed/cronjobs/speed-codekube-ca',
              'uid': 'd3b0ed6d-af82-11e7-ab9c-42010af000ee',
              'resourceVersion': '561035',
              'creationTimestamp': '2017-10-12T19:23:29Z',
              'labels': {
                'run': 'speed-codekube-ca'
              },
              'annotations': {
                'username': 'markmssd',
                'urls': 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            'spec': {
              'schedule': '0/60 * * * ?',
              'concurrencyPolicy': 'Replace',
              'successfulJobsHistoryLimit': 5,
              'failedJobsHistoryLimit': 5,
              'suspend': false,
              'jobTemplate': {
                'metadata': {
                  'creationTimestamp': null
                },
                'spec': {
                  'template': {
                    'metadata': {
                      'creationTimestamp': null,
                      'labels': {
                        'run': 'speed-codekube-ca'
                      }
                    },
                    'spec': {
                      'containers': [
                        {
                          'name': 'speed-codekube-ca',
                          'image': 'sitespeedio/sitespeed.io:5.6.5',
                          'args': [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '-b',
                            'chrome',
                            '--speedIndex',
                            '--html.showAllWaterfallSummary',
                            '--gpsi.key',
                            'GPSI_KEY',
                          ],
                          'env': [
                            {
                              'name': 'CRON_NAME',
                              'value': 'speed-github-com'
                            }
                          ],
                          'lifecycle': {
                            'postStart': {
                              'exec': {
                                'command': [
                                  '/bin/sh',
                                  '-c',
                                  'cp /tmp/customstorage/index.js /usr/src/app/lib/support/resultsStorage/index.js'
                                ]
                              }
                            }
                          },
                          'volumeMounts': [
                            {
                              'mountPath': '/tmp/customstorage/',
                              'name': 'customstorage'
                            }
                          ],
                          'resources': {},
                          'terminationMessagePath': '/dev/termination-log',
                          'terminationMessagePolicy': 'File',
                          'imagePullPolicy': 'Always'
                        }
                      ],
                      'volumes': [
                        {
                          'configMap': {
                            'defaultMode': 420,
                            'name': 'customstorage'
                          },
                          'name': 'customstorage'
                        }
                      ],
                      'restartPolicy': 'OnFailure',
                      'terminationGracePeriodSeconds': 30,
                      'dnsPolicy': 'ClusterFirst',
                      'securityContext': {},
                      'schedulerName': 'default-scheduler'
                    }
                  }
                }
              }
            },
            'status': {
              'lastScheduleTime': '2017-10-17T17:00:00Z'
            }
          });

          done();
        })
        .catch(done);
    });
  });

  describe('deleteCronJob()', () => {
    it('should throw if username is missing', (done) => {
      const name = 'speed-codekube-ca';

      SiteSpeedService.deleteCronJob(null, name)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestDelete.called).to.be(false);
          expect(error).to.equal('username is required');

          done();
        });
    });

    it('should throw if name is missing', (done) => {
      const name = null;

      SiteSpeedService.deleteCronJob('markmssd', name)
        .then(() => done('shit'))
        .catch(error => {
          expect(requestDelete.called).to.be(false);
          expect(error).to.equal('name is required');

          done();
        });
    });

    it('should delete', (done) => {
      const name = 'speed-codekube-ca';

      SiteSpeedService.deleteCronJob('markmssd', name)
        .then((cronjob) => {
          expect(requestDelete.getCall(0).args[0].uri).to.equal(K8S_BASE_URL + `/apis/batch/v1beta1/namespaces/${K8S_NAMESPACE}/cronjobs/speed-codekube-ca`);
          expect(requestDelete.getCall(0).args[0].auth).to.eql({ bearer: K8S_TOKEN });
          expect(requestDelete.getCall(0).args[0].strictSSL).to.equal(false);
          expect(requestDelete.getCall(0).args[0].json).to.equal(true);

          // graphite/secrets are gone
          expect(cronjob).to.eql({
            'metadata': {
              'name': 'speed-codekube-ca',
              'namespace': 'sitespeed',
              'selfLink': '/apis/batch/v1beta1/namespaces/sitespeed/cronjobs/speed-codekube-ca',
              'uid': 'd3b0ed6d-af82-11e7-ab9c-42010af000ee',
              'resourceVersion': '561035',
              'creationTimestamp': '2017-10-12T19:23:29Z',
              'labels': {
                'run': 'speed-codekube-ca'
              },
              'annotations': {
                'username': 'markmssd',
                'urls': 'https://www.yellowpages.ca/,https://preprod-ui.yellowpages.ca/,https://qa-ui-mtl.yellowpages.ca/'
              }
            },
            'spec': {
              'schedule': '0/60 * * * ?',
              'concurrencyPolicy': 'Replace',
              'successfulJobsHistoryLimit': 5,
              'failedJobsHistoryLimit': 5,
              'suspend': false,
              'jobTemplate': {
                'metadata': {
                  'creationTimestamp': null
                },
                'spec': {
                  'template': {
                    'metadata': {
                      'creationTimestamp': null,
                      'labels': {
                        'run': 'speed-codekube-ca'
                      }
                    },
                    'spec': {
                      'containers': [
                        {
                          'name': 'speed-codekube-ca',
                          'image': 'sitespeedio/sitespeed.io:5.6.5',
                          'args': [
                            'https://www.yellowpages.ca/',
                            'https://preprod-ui.yellowpages.ca/',
                            'https://qa-ui-mtl.yellowpages.ca/',
                            '-b',
                            'chrome',
                            '--speedIndex',
                            '--html.showAllWaterfallSummary',
                            '--gpsi.key',
                            'GPSI_KEY'
                          ],
                          'env': [
                            {
                              'name': 'CRON_NAME',
                              'value': 'speed-github-com'
                            }
                          ],
                          'lifecycle': {
                            'postStart': {
                              'exec': {
                                'command': [
                                  '/bin/sh',
                                  '-c',
                                  'cp /tmp/customstorage/index.js /usr/src/app/lib/support/resultsStorage/index.js'
                                ]
                              }
                            }
                          },
                          'volumeMounts': [
                            {
                              'mountPath': '/tmp/customstorage/',
                              'name': 'customstorage'
                            }
                          ],
                          'resources': {},
                          'terminationMessagePath': '/dev/termination-log',
                          'terminationMessagePolicy': 'File',
                          'imagePullPolicy': 'Always'
                        }
                      ],
                      'volumes': [
                        {
                          'configMap': {
                            'defaultMode': 420,
                            'name': 'customstorage'
                          },
                          'name': 'customstorage'
                        }
                      ],
                      'restartPolicy': 'OnFailure',
                      'terminationGracePeriodSeconds': 30,
                      'dnsPolicy': 'ClusterFirst',
                      'securityContext': {},
                      'schedulerName': 'default-scheduler'
                    }
                  }
                }
              }
            },
            'status': {
              'lastScheduleTime': '2017-10-17T17:00:00Z'
            }
          });

          done();
        })
        .catch(done);
    });
  });

  describe('getCronJobS3Reports()', () => {
    it('should return reports urls[], sorted from newest to oldest', (done) => {
      // stub S3
      const s3Stub = {
        promise: () => Promise.resolve(_.cloneDeep(require('../fixtures/s3/objects-list.json')))
      };
      const makeRequestStub = sinon.stub(AWS.Service.prototype, 'makeRequest').returns(s3Stub);

      SiteSpeedService.getCronJobS3Reports('codekube-ca')
        .then(urls => {
          // should not rely on internal aws implementation...
          expect(makeRequestStub.getCall(0).args).to.eql(
            ['listObjectsV2',
              {
                Bucket: 'SITESPEED_S3_BUCKET',
                Delimiter: '/',
                Prefix: 'codekube-ca/',
                MaxKeys: 1000
              },
              undefined]
          );

          expect(urls.map(url => url.url)).to.eql([
            'http://SITESPEED_S3_BUCKET/www.yellowpages.ca/2017-10-13-12-13-14/index.html',
            'http://SITESPEED_S3_BUCKET/www.yellowpages.ca/2017-10-12-13-14-15/index.html',
            'http://SITESPEED_S3_BUCKET/www.yellowpages.ca/2017-10-12-12-13-14/index.html'
          ]);

          done();
        })
        .catch(done);
    });
  });
});
