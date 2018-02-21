const request = require('request-promise');
const qs = require('query-string');
const PermissionsService = require('../services/permissions.service');
const CryptoUtils = require('../utils/crypto.utils');
const UserModel = require('../models/user.model');
const JwtUtils = require('../utils/jwt.utils');
const config = require('../../config');

const SECRET_KEY = config.bitbucket.secretKey;

/**
 * Returns Bitbucket's Authorization Url
 * @param callbackUrl
 * @returns {*}
 */
exports.getAuthorizationUrl = (callbackUrl) => {
  const url = config.bitbucket.requestTokenURL;
  const oauth = {
    callback: callbackUrl, // config.bitbucket.callbackURL,
    consumer_key: config.bitbucket.consumerKey,
    private_key: config.bitbucket.consumerSecret,
    signature_method: config.bitbucket.signatureMethod
  };

  return request.post({ url, oauth })
    .then(body => qs.parse(body))
    .then(parsedBody => `${config.bitbucket.userAuthorizationURL}?oauth_token=${parsedBody.oauth_token}`);
};

/**
 * Endpoint called by Bitbucket after OAuth1 login
 * @param oauthToken
 * @param oauthVerifier
 * @returns {*}
 */
exports.loginCallback = (oauthToken, oauthVerifier) => {
  const url = config.bitbucket.accessTokenURL;
  const oauth = {
    consumer_key: config.bitbucket.consumerKey,
    private_key: config.bitbucket.consumerSecret,
    signature_method: config.bitbucket.signatureMethod,
    token: oauthToken,
    verifier: oauthVerifier
  };

  return request.post({ url, oauth })
    .then(body => qs.parse(body))
    .then((parsedBody) => {
      const currentUserIdUrl = config.bitbucket.currentUserId;

      // replace token_secret with access_token
      oauth.token_secret = parsedBody.oauth_token_secret;
      oauth.token = parsedBody.oauth_token;

      return request.get({ url: currentUserIdUrl, oauth });
    })
    .then((slug) => {
      const userProfileUrl = `${config.bitbucket.userProfileURL}/${slug}`;
      return request.get({ url: userProfileUrl, oauth, json: true });
    })
    .then((profile) => {
      let user = convertBitbucketUserToUserModel(profile, oauth.token, oauth.token_secret);

      return UserModel.findOneAndUpdate(
        {
          username: user.username
        },
        user,
        {
          upsert: true,
          new: true,
          runValidators: true
        })
        .lean();
    })
    .then((user) => {
      // sync user's permissions
      PermissionsService.updateNamespacePermissions(user.username);

      user.token = JwtUtils.sign(user);
      return user;
    })
    .catch((error) => console.log('ERROR', error));
};

function convertBitbucketUserToUserModel (bitbucketUser, token, tokenSecret) {
  if (!bitbucketUser) {
    return null;
  }

  return {
    name: bitbucketUser.displayName,
    username: bitbucketUser.slug,
    email: bitbucketUser.emailAddress,
    avatar: config.bitbucket.userAvatarURL.replace('%SLUG%', bitbucketUser.slug),
    type: bitbucketUser.type,
    isActive: bitbucketUser.active,
    bitbucket: {
      token: CryptoUtils.encrypt(token, SECRET_KEY),
      tokenSecret: CryptoUtils.encrypt(tokenSecret, SECRET_KEY),
    },
  };
}
