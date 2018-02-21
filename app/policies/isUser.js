const httpStatus = require('http-status');
const UserModel = require('../models/user.model');
const JwtUtils = require('../utils/jwt.utils');

exports.isUser = (req, res, next) => {
  const token = req.headers.token || req.query.token;

  JwtUtils.verifyToken(token)
    .then(decoded => UserModel.findByUsername(decoded.username))
    .then(user => {
      req.user = user;
      next();
    })
    .catch(() => res.status(httpStatus.UNAUTHORIZED).send({ error: 'Unauthorized' }));
};
