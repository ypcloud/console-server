const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * News schema
 */
const NewsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  synopsis: {
    type: String
  },
  text: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

NewsSchema.method({});

/**
 * Statics
 */
NewsSchema.statics = {
  /**
   * List news in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of news to be skipped.
   * @param {number} limit - Limit number of news to be returned.
   * @returns {Promise<News[]>}
   */
  list ({ skip = 0, limit = 1000 } = {}) {
    return this.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

/**
 * Register
 */
module.exports = mongoose.model('News', NewsSchema);
