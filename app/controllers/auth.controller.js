const AuthService = require('../services/auth.service');

/**
 * Valid if isUser (protected by route middleware)
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.validate = (req, res, next) => {
  res.status(200).json({
    result: true,
    data: true
  });
};

/**
 * Get Bitbucket's authorization's url
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getAuthorizationUrl = (req, res, next) => {
  const callbackUrl = req.query.callback;

  AuthService.getAuthorizationUrl(callbackUrl)
    .then((authorizationUrl) => {
      res.status(200).json({
        result: true,
        data: authorizationUrl
      });
    })
    .catch(() => next(new Error('Authentication error')));
};

/**
 * Endpoint called by Bitbucket after OAuth1 login
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.loginCallback = (req, res, next) => {
  const oauthToken = req.query.oauth_token;
  const oauthVerifier = req.query.oauth_verifier;

  AuthService.loginCallback(oauthToken, oauthVerifier)
    .then((response) => {
      res.status(200).json({
        result: true,
        data: response
      });
    })
    .catch(() => next(new Error('Authentication error')));
};
