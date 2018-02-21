const _ = require('lodash');

function isArrayEqual (x, y) {
  if ((!x && y) || (x && !y)) {
    return false;
  }

  return _(x).differenceWith(y, _.isEqual).isEmpty();
}

module.exports = isArrayEqual;
