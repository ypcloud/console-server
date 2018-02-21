const MetricModel = require('../models/metric.model');

exports.getLatestMetric = (type) => {
  return MetricModel.find({ type: type })
    .sort({ date: -1 })
    .limit(1)
    .then(metrics => metrics[0]);
};

/**
 * Get last metrics count of the specified type,
 * or of all types if none specified.
 */
exports.getMetricsCount = function (types, since, until) {
  let query = {};

  if (types && types instanceof Array) {
    query = {
      type: { $in: types }
    };
  }

  // init our date query, if needed
  if (since || until) {
    query.date = {};
  }

  if (since) {
    query.date.$gte = since;
  }

  if (until) {
    query.date.$lte = until;
  }

  return MetricModel.find(query)
    .sort({ date: -1 });
};

/**
 * Save total count of pods for specified date.
 * Date defaults to today
 */
exports.saveMetricDaily = function (type, count, date) {
  date = date || new Date();
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return MetricModel.findOneAndUpdate(
    {
      date: date,
      type: type
    },
    {
      date: date,
      type: type,
      value: count
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    })
    .then(saved => {
      console.log(`\u2713 Saved ${type} metric (${count}), ${date}`);
      return saved;
    });
};
