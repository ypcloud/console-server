const mongoose = require('mongoose');

/**
 * User schema
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    lowercase: true
  },
  bitbucket: {
    token: String,
    tokenSecret: String,
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Statics
 */
UserSchema.statics = {

  findByUsername (username) {
    return this.findOne({ username })
      .then(user => {
        if (user) {
          return user;
        } else {
          throw new Error('Not found');
        }
      });
  }

};

/**
 * Register
 */
module.exports = mongoose.model('User', UserSchema);
