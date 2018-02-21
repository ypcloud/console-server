const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const config = require('../../config/index');

const JWT_SECRET = config.jwt;

exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (error, decoded) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(decoded);
      }
    });
  });
};

exports.sign = (user) => {
  return jwt.sign({
    id: user._id,
    username: user.username,
  }, JWT_SECRET);
};
