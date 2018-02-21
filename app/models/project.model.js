const mongoose = require('mongoose');

/**
 * Project Schema
 */
const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    required: true
  },
  namespaces: [
    {
      name: {
        type: String,
        index: true,
        required: true
      },
      clusters: {
        type: Array,
        default: []
      },
    }
  ],
  repository: {
    owner: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  isDeleted: {
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
ProjectSchema.statics = {
  /**
   * List projects in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of projects to be returned.
   * @returns {Promise<Project[]>}
   */
  list ({ skip = 0, limit = 1000 } = {}) {
    return this.find()
      .sort({ name: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  findByName (name) {
    return this.findOne({ name: decodeURIComponent(name) })
      .then(project => {
        if (project) {
          return project;
        } else {
          throw new Error('Not found');
        }
      });
  },

  findOneByNamespace (namespace) {
    return this.findOne({ 'namespaces.name': namespace })
      .then(project => {
        if (project) {
          return project;
        } else {
          throw new Error('Not found');
        }
      });
  },

  findByNamespace (query) {
    query = decodeURIComponent(query);
    query = new RegExp(query.toLowerCase(), 'i');

    return this.find({
      $or: [
        { 'name': { $regex: query } },
        { 'namespaces.name': { $regex: query } },
      ]
    });
  }
};

/**
 * Register
 */
module.exports = mongoose.model('Project', ProjectSchema);
