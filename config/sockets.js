const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const UserModel = require('../app/models/user.model');
const JwtUtils = require('../app/utils/jwt.utils');

module.exports = (server) => {
  const io = require('socket.io')(server);

  // secure sockets with the token
  io.use((socket, next) => {
    let token = _.get(socket, 'handshake.query.token');

    if (_.isNil(token) || token === 'null') {
      return next(new Error('Sockets Authentication Error'));
    }

    JwtUtils.verifyToken(token)
      .then(decoded => UserModel.findByUsername(decoded.username))
      .then(() => next())
      .catch(() => next(new Error('Sockets Authentication Error')));
  });

  io.on('connection', (socket) => {
    // init all sockets files
    let sockets = glob.sync('**/*.socket.js');
    sockets.forEach(function (socketConfiguration) {
      require(path.resolve(socketConfiguration))(io, socket);
    });
  });
};
