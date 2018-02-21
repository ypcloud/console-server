// We do not store everything in consul for now
// Thus, secret secrets are injected via env vars, because they're secret...

module.exports = {
  jwt: process.env._JWT_SECRET,
  bitbucket: {
    consumerKey: process.env._BITBUCKET_CONSUMER_KEY,
    consumerSecret: process.env._BITBUCKET_CONSUMER_SECRET,
  },
  consul: {
    token: process.env._CONSUL_TOKEN,
  },
  drone: {
    token: process.env._DRONE_TOKEN,
  },
  elasticsearch: {
    amazonES: {
      accessKeyId: process.env._AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env._AWS_SECRET_ACCESS_KEY
    }
  },
  kubernetes: {
    clusters: {
      aws: {
        token: process.env._K8S_TOKEN_AWS
      },
      gce: {
        token: process.env._K8S_TOKEN_GCE
      }
    }
  },
  sitespeed: {
    s3: {
      key: process.env._SITESPEED_S3_KEY,
      secret: process.env._SITESPEED_S3_SECRET
    },
    k8s: {
      token: process.env._SITESPEED_K8S_TOKEN
    }
  }
};
