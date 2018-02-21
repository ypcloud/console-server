const { describe, it } = require('eslint/lib/testers/event-generator-tester');
const expect = require('expect.js');
const _ = require('lodash');
const isArrayEqual = require('../helpers/isArrayEqual.helper');
const KubernetesUtils = require('../../app/utils/kubernetes.utils');

describe('KubernetesUtils tests', function () {

  const deployments = require('../fixtures/kubernetes/deployments.json');
  const namespace = require('../fixtures/kubernetes/namespace.json');
  const nodes = require('../fixtures/kubernetes/nodes.json');

  describe('extractNamespaceName()', function () {
    it('should return null if not found', function (done) {
      const name = KubernetesUtils.extractNamespaceName({});

      expect(name).to.equal(null);
      done();
    });

    it('should return name if found', function (done) {
      const name = KubernetesUtils.extractNamespaceName(namespace);

      expect(name).to.equal('namespaceName');
      done();
    });
  });

  describe('extractNamespaceRepo()', function () {
    it('should return null if not found', function (done) {
      const repo = KubernetesUtils.extractNamespaceRepo({});

      expect(repo).to.equal(null);
      done();
    });

    it('should return repo if found', function (done) {
      const repo = KubernetesUtils.extractNamespaceRepo(namespace);

      expect(repo).to.equal('owner/repo');
      done();
    });
  });

  describe('extractNamespaceRepoOwner()', function () {
    it('should return null if not found', function (done) {
      const owner = KubernetesUtils.extractNamespaceRepoOwner({});

      expect(owner).to.equal(null);
      done();
    });

    it('should return repo owner if found', function (done) {
      const owner = KubernetesUtils.extractNamespaceRepoOwner(namespace);

      expect(owner).to.equal('owner');
      done();
    });
  });

  describe('extractNamespaceRepoName()', function () {
    it('should return null if not found', function (done) {
      const name = KubernetesUtils.extractNamespaceRepoName({});

      expect(name).to.equal(null);
      done();
    });

    it('should return repo name if found', function (done) {
      const name = KubernetesUtils.extractNamespaceRepoName(namespace);

      expect(name).to.equal('repo');
      done();
    });
  });

  describe('extractNamespaceRepoBranch()', function () {
    it('should return empty string if not found', function (done) {
      const branch = KubernetesUtils.extractNamespaceRepoBranch({});

      expect(branch).to.equal('');
      done();
    });

    it('should return repo name if found', function (done) {
      const branch = KubernetesUtils.extractNamespaceRepoBranch(namespace);

      expect(branch).to.equal('branch');
      done();
    });
  });

  describe('extractNamespaceNameWithoutEnvironment()', function () {
    it('should return null if no namespace provided', function (done) {
      const name = KubernetesUtils.extractNamespaceNameWithoutEnvironment(null, 'develop');

      expect(name).to.equal(null);
      done();
    });

    it('should return namespace as is if no branch provided', function (done) {
      const name = KubernetesUtils.extractNamespaceNameWithoutEnvironment('console-develop', null);

      expect(name).to.equal('console-develop');
      done();
    });

    it('should return `console-server` when develop branch', function (done) {
      const name = KubernetesUtils.extractNamespaceNameWithoutEnvironment('console-server-develop', 'develop');

      expect(name).to.equal('console-server');
      done();
    });

    it('should return `console-server` when release branch', function (done) {
      const name = KubernetesUtils.extractNamespaceNameWithoutEnvironment('console-server-qa', 'release');

      expect(name).to.equal('console-server');
      done();
    });

    it('should return `console-server` when master branch', function (done) {
      const name = KubernetesUtils.extractNamespaceNameWithoutEnvironment('console-server', 'master');

      expect(name).to.equal('console-server');
      done();
    });
  });

  describe('extractNamespaceEnvironment()', function () {
    it('should return null if no namespace provided', function (done) {
      const env = KubernetesUtils.extractNamespaceEnvironment(null, 'develop');

      expect(env).to.equal(null);
      done();
    });

    it('should return null if no branch provided', function (done) {
      const env = KubernetesUtils.extractNamespaceEnvironment('console-develop', null);

      expect(env).to.equal(null);
      done();
    });

    it('should return `develop`', function (done) {
      const env = KubernetesUtils.extractNamespaceEnvironment('console-server-develop', 'develop');

      expect(env).to.equal('dev');
      done();
    });

    it('should return `qa`', function (done) {
      const env = KubernetesUtils.extractNamespaceEnvironment('console-server-qa', 'release/0.0.2');

      expect(env).to.equal('qa');
      done();
    });

    it('should return `prod`', function (done) {
      const env = KubernetesUtils.extractNamespaceEnvironment('console-server', 'master');

      expect(env).to.equal('prod');
      done();
    });

    it('should return null if none of the cases', function (done) {
      const env = KubernetesUtils.extractNamespaceEnvironment('console-server', 'feature');

      expect(env).to.equal(null);
      done();
    });
  });

  describe('extractDeploymentEnvironmentVariables()', function () {
    it('should return [] if passed null', function (done) {
      const extracted = KubernetesUtils.extractDeploymentEnvironmentVariables(null);

      expect(extracted.length).to.equal(0);
      done();
    });

    it('should return [] if passed an invalid deployment', function (done) {
      const extracted = KubernetesUtils.extractDeploymentEnvironmentVariables(namespace);

      expect(extracted.length).to.equal(0);
      done();
    });

    it('should extract the list of environment variables from deployment', function (done) {
      const extracted = KubernetesUtils.extractDeploymentEnvironmentVariables(deployments);
      const expected = [
        {
          name: 'SOAJS_SERVICE_NAME',
          value: 'recosvc4'
        },
        {
          name: 'SOAJS_ENV',
          value: 'prod'
        },
        {
          name: 'SOAJS_PROFILE',
          value: '/run/secrets/codekube.io/soajs.js'
        }
      ];

      expect(isArrayEqual(extracted, expected)).to.equal(true);
      done();
    });
  });

  describe('extractIngressesHosts()', function () {
    it('should return [] if passed null', function (done) {
      const extracted = KubernetesUtils.extractIngressesHosts(null);

      expect(extracted.length).to.equal(0);
      done();
    });

    it('should return hosts, AWS', function (done) {
      const ingresses = require('../fixtures/kubernetes/ingresses-aws.json');
      const extracted = KubernetesUtils.extractIngressesHosts(ingresses.items);

      expect(extracted).to.eql(['namespaceName-aws.codekube.io', 'namespaceName-develop-aws.codekube.io']);
      done();
    });

    it('should return hosts, GCE', function (done) {
      const ingresses = require('../fixtures/kubernetes/ingresses-gce.json');
      const extracted = KubernetesUtils.extractIngressesHosts(ingresses.items);

      expect(extracted).to.eql(['namespaceName-gce.codekube.io', 'namespaceName-develop-gce.codekube.io']);
      done();
    });
  });

  describe('extractLabelsServiceAttributes()', function () {
    it('should return {} if passed null', function (done) {
      const extracted = KubernetesUtils.extractLabelsServiceAttributes(null);

      expect(extracted).to.eql({});
      done();
    });

    it('should return labels, AWS', function (done) {
      const ingresses = require('../fixtures/kubernetes/ingresses-aws.json');
      const extracted = KubernetesUtils.extractLabelsServiceAttributes(ingresses.items);

      expect(extracted).to.eql({
        'codekube.io/service.env': 'dev',
        'codekube.io/service.name': 'serviceName',
        'codekube.io/service.group': 'g1',
        'codekube.io/service.version': 'v1'
      });

      done();
    });

    it('should return labels, GCE', function (done) {
      const ingresses = require('../fixtures/kubernetes/ingresses-gce.json');
      const extracted = KubernetesUtils.extractLabelsServiceAttributes(ingresses.items);

      expect(extracted).to.eql({});
      done();
    });
  });

  describe('getMaxRevisions()', function () {
    it('should return 0 if passed null', function (done) {
      const extracted = KubernetesUtils.getMaxRevisions(null);

      expect(extracted).to.equal(0);
      done();
    });

    it('should return max revisions (29)', function (done) {
      const deployments = require('../fixtures/kubernetes/deployments.json');
      const extracted = KubernetesUtils.getMaxRevisions(deployments);

      expect(extracted).to.equal(29);
      done();
    });
  });

  describe('getEnvironmentVariableValue()', function () {
    it('should return null if passed null envVars', function (done) {
      const value = KubernetesUtils.getEnvironmentVariableValue(null, 'SOAJS_SERVICE_NAME');

      expect(value).to.equal(null);
      done();
    });

    it('should return null if passed null envVar', function (done) {
      const value = KubernetesUtils.getEnvironmentVariableValue([
        {
          name: 'SOAJS_SERVICE_NAME',
          value: 'recosvc4'
        },
        {
          name: 'SOAJS_ENV',
          value: 'prod'
        }], null);

      expect(value).to.equal(null);
      done();
    });

    it('should return correct value if passed envVars and envVar', function (done) {
      const value = KubernetesUtils.getEnvironmentVariableValue([
        {
          name: 'SOAJS_SERVICE_NAME',
          value: 'recosvc4'
        },
        {
          name: 'SOAJS_ENV',
          value: 'prod'
        }], 'SOAJS_SERVICE_NAME');

      expect(value).to.equal('recosvc4');
      done();
    });
  });

  describe('isSoaJSService()', function () {
    it('should return false if passed null', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService(null);

      expect(isSoaJSService).to.equal(false);
      done();
    });

    it('should return false if passed an object', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService({});

      expect(isSoaJSService).to.equal(false);
      done();
    });

    it('should return false if passed an object', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService({});

      expect(isSoaJSService).to.equal(false);
      done();
    });

    it('should return false if SOAJS_PROFILE env not found', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService([
        {
          name: 'SOAJS_SERVICE_NAME',
          value: 'recosvc4'
        },
        {
          name: 'SOAJS_ENV',
          value: 'prod'
        }
      ]);

      expect(isSoaJSService).to.equal(false);
      done();
    });

    it('should return false if SOAJS_ENV env not found', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService([
        {
          name: 'SOAJS_SERVICE_NAME',
          value: 'recosvc4'
        },
        {
          name: 'SOAJS_PROFILE',
          value: '/run/secrets/codekube.io/soajs.js'
        }
      ]);

      expect(isSoaJSService).to.equal(false);
      done();
    });

    it('should return false if SOAJS_SERVICE_NAME env not found', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService([
        {
          name: 'SOAJS_ENV',
          value: 'prod'
        },
        {
          name: 'SOAJS_PROFILE',
          value: '/run/secrets/codekube.io/soajs.js'
        }
      ]);

      expect(isSoaJSService).to.equal(false);
      done();
    });

    it('should return true if SOAJS_PROFILE, SOAJS_ENV, SOAJS_SERVICE_NAME env are found', function (done) {
      const isSoaJSService = KubernetesUtils.isSoaJSService([
        {
          name: 'SOAJS_SERVICE_NAME',
          value: 'recosvc4'
        },
        {
          name: 'SOAJS_ENV',
          value: 'prod'
        },
        {
          name: 'SOAJS_PROFILE',
          value: '/run/secrets/codekube.io/soajs.js'
        }
      ]);

      expect(isSoaJSService).to.equal(true);
      done();
    });
  });

  describe('getNodesTotalCPU()', function () {
    it('should return 0 if passed null', function (done) {
      const cpu = KubernetesUtils.getNodesTotalCPU(null);

      expect(cpu).to.equal(0);
      done();
    });

    it('should return 0 if passed invalid node list', function (done) {
      const cpu = KubernetesUtils.getNodesTotalCPU({});

      expect(cpu).to.equal(0);
      done();
    });

    it('should return 20 if passed valid node list', function (done) {
      const cpu = KubernetesUtils.getNodesTotalCPU(nodes.items);

      expect(cpu).to.equal(20);
      done();
    });
  });

  describe('getNodesTotalMemory()', function () {
    it('should return 0 if passed null', function (done) {
      const memory = KubernetesUtils.getNodesTotalMemory(null);

      expect(memory).to.equal(0);
      done();
    });

    it('should return 0 if passed invalid node list', function (done) {
      const memory = KubernetesUtils.getNodesTotalMemory({});

      expect(memory).to.equal(0);
      done();
    });

    it('should return 82337096 if passed valid node list', function (done) {
      const memory = KubernetesUtils.getNodesTotalMemory(nodes.items);

      expect(memory).to.equal(82337096);
      done();
    });
  });

  describe('removeCronJobSecretArgs()', function () {
    const cronjobs = require('../fixtures/kubernetes/cronjobs.json');

    it('should return cronjob without secret args', function (done) {
      const cleanCronJob = KubernetesUtils.removeCronJobSecretArgs(_.cloneDeep(cronjobs.items[0]));

      expect(cleanCronJob).to.eql({
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
    });
  });

  describe('removeCronJobAllArgs()', function () {
    const cronjobs = require('../fixtures/kubernetes/cronjobs.json');

    it('should return cronjob without ANY secret args', function (done) {
      const cleanCronJob = KubernetesUtils.removeCronJobAllArgs(_.cloneDeep(cronjobs.items[0]));

      expect(cleanCronJob).to.eql({
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
                      'args': [],
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
    });
  });

  describe('removeNonUserCronJobArgs()', function () {
    const cronjobs = require('../fixtures/kubernetes/cronjobs.json');

    it('should return null if passed null', function (done) {
      const cleanCronJobs = KubernetesUtils.removeNonUserCronJobArgs('markmssd', null);

      expect(cleanCronJobs).to.equal(null);
      done();
    });

    it('should return user\'s cronjob with args', function (done) {
      const cleanCronJobs = KubernetesUtils.removeNonUserCronJobArgs('markmssd', _.cloneDeep(cronjobs.items[0]));

      expect(cleanCronJobs).to.eql({
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
    });

    it('should return non-user\'s cronjob without args', function (done) {
      const cleanCronJobs = KubernetesUtils.removeNonUserCronJobArgs('unauthorizedUser', _.cloneDeep(cronjobs.items[1]));

      expect(cleanCronJobs).to.eql({
        'metadata': {
          'name': 'speed-github-com',
          'namespace': 'sitespeed',
          'selfLink': '/apis/batch/v1beta1/namespaces/sitespeed/cronjobs/speed-github-com',
          'uid': 'd3b0ed6d-af82-11e7-ab9c-42010af000ee',
          'resourceVersion': '561035',
          'creationTimestamp': '2017-10-12T19:23:29Z',
          'labels': {
            'run': 'speed-github-com'
          },
          'annotations': {
            'username': 'mlopezc1',
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
                    'run': 'speed-github-com'
                  }
                },
                'spec': {
                  'containers': [
                    {
                      'name': 'speed-github-com',
                      'image': 'sitespeedio/sitespeed.io:5.6.5',
                      'args': [],
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
          'lastScheduleTime': '2017-10-12T17:00:00Z'
        }
      });

      done();
    });
  });
});
