const mongoose = require('mongoose');

exports.load = (collection, fixture) => {
  const Model = mongoose.model(collection);
  return Model.collection.insert(fixture);
};

exports.deleteAll = (collection) => {
  const Model = mongoose.model(collection);
  return Model.collection.remove({});
};
