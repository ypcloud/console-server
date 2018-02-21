const mongoose = require('mongoose');

/**
 * Permission Schema
 */
const PermissionSchema = new mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  roles: [{
    type: String,
    enum: ['user', 'developer', 'technical_owner', 'product_owner', 'admin'],
    default: ['user'],
    required: 'Please provide at least one role'
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: []
  }]
});

/**
 * Statics
 */
PermissionSchema.statics = {

  findByUsername (username) {
    return this.findOne({ username })
      .then(permission => {
        if (permission) {
          return permission;
        } else {
          throw new Error('Not found');
        }
      });
  },

  getUserProjects (username) {
    return this.findByUsername(username)
      .then((permission) => permission.populate('projects').execPopulate())
      .then((permission) => permission.projects);
  }
};

/**
 * Register
 */
module.exports = mongoose.model('Permission', PermissionSchema);
