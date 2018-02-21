const httpStatus = require('http-status');
const _ = require('lodash');
const config = require('../../config/index');

exports.isAdminUser = (req, res, next) => {
  const username = req.user ? req.user.username : null;

  if (this.isAdminUsername(username)) {
    next();
  } else {
    res.status(httpStatus.UNAUTHORIZED).send({ error: 'Unauthorized' });
  }
};

exports.isAdminUsername = (username) => {
  return config.admins && _.isArray(config.admins) && config.admins.includes(username);
};
