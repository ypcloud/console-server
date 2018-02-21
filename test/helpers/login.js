const JwtUtils = require('../../app/utils/jwt.utils');
const UserModel = require('../../app/models/user.model');

exports.createUser = (user) => {
  return UserModel.findOneAndUpdate(
    {
      username: user.username
    },
    user,
    {
      upsert: true,
      new: true,
      runValidators: true
    });
};

exports.deleteUser = (username) => {
  return UserModel.findOne({ username }).remove();
};

exports.getJWT = (username) => {
  return UserModel.findOne({ username }).lean()
    .then(user => JwtUtils.sign(user));
};
