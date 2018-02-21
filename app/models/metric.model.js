const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Metric schema
 */
const MetricSchema = new Schema({
  date: {
    type: Date,
    required: 'Metric\'s date is required',
    index: {
      sparse: true // we will be querying by date
    }
  },
  type: {
    type: String,
    required: 'Metric\'s type is required'
  },
  value: {
    type: String,
    required: 'Metric\'s value is required'
  }
});

/**
 * Register
 */
module.exports = mongoose.model('Metric', MetricSchema);
