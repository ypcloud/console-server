const { afterEach, beforeEach } = require('mocha');
const request = require('request-promise');
const expect = require('expect.js');
const sinon = require('sinon');
const KubernetesHeapsterService = require('../../app/services/kubernetes.heapster.service');

describe('Kubernetes Heapster Service tests', function () {
  let requestGet;

  const expectedAuth = {
    aws: {
      bearer: 'K8S_TOKEN_AWS'
    },
    gce: {
      bearer: 'K8S_TOKEN_GCE'
    }
  };

  beforeEach(function () {
    requestGet = sinon.stub(request, 'get').resolves({});
  });

  afterEach(function () {
    request.get.restore();
  });

  it('should call correct endpoint for AWS getNamespaceMemoryUsage', function (done) {
    KubernetesHeapsterService.getNamespaceMemoryUsage('aws', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/memory/usage');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

        done();
      });
  });

  it('should call correct endpoint for GCE getNamespaceMemoryUsage', function (done) {
    KubernetesHeapsterService.getNamespaceMemoryUsage('gce', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesGceUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/memory/usage');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

        done();
      });
  });

  it('should call correct endpoint for AWS getNamespaceCPUUsageRate', function (done) {
    KubernetesHeapsterService.getNamespaceCPUUsageRate('aws', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/cpu/usage_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

        done();
      });
  });

  it('should call correct endpoint for GCE getNamespaceCPUUsageRate', function (done) {
    KubernetesHeapsterService.getNamespaceCPUUsageRate('gce', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesGceUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/cpu/usage_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

        done();
      });
  });

  it('should call correct endpoint for AWS getPodMemoryUsage', function (done) {
    KubernetesHeapsterService.getPodMemoryUsage('aws', 'namespace', 'pod')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/pods/pod/metrics/memory/usage');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

        done();
      });
  });

  it('should call correct endpoint for GCE getPodMemoryUsage', function (done) {
    KubernetesHeapsterService.getPodMemoryUsage('gce', 'namespace', 'pod')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesGceUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/pods/pod/metrics/memory/usage');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

        done();
      });
  });

  it('should call correct endpoint for AWS getPodCPUUsageRate', function (done) {
    KubernetesHeapsterService.getPodCPUUsageRate('aws', 'namespace', 'pod')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/pods/pod/metrics/cpu/usage_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);
        done();
      });
  });

  it('should call correct endpoint for GCE getPodCPUUsageRate', function (done) {
    KubernetesHeapsterService.getPodCPUUsageRate('gce', 'namespace', 'pod')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesGceUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/pods/pod/metrics/cpu/usage_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

        done();
      });
  });

  it('should call correct endpoint for AWS getNetworkReceivedRate', function (done) {
    KubernetesHeapsterService.getNetworkReceivedRate('aws', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/network/rx_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

        done();
      });
  });

  it('should call correct endpoint for GCE getNetworkReceivedRate', function (done) {
    KubernetesHeapsterService.getNetworkReceivedRate('gce', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesGceUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/network/rx_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

        done();
      });
  });

  it('should call correct endpoint for AWS getNetworkSentRate', function (done) {
    KubernetesHeapsterService.getNetworkSentRate('aws', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesAwsUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/network/tx_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.aws);

        done();
      });
  });

  it('should call correct endpoint for GCE getNetworkSentRate', function (done) {
    KubernetesHeapsterService.getNetworkSentRate('gce', 'namespace')
      .then(function () {
        expect(requestGet.getCall(0).args[0].uri).to.equal('https://kubernetesGceUrl.com/api/v1/proxy/namespaces/kube-system/services/heapster/api/v1/model/namespaces/namespace/metrics/network/tx_rate');
        expect(requestGet.getCall(0).args[0].auth).to.eql(expectedAuth.gce);

        done();
      });
  });

});
