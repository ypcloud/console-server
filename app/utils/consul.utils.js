const _ = require('lodash');

/**
 * Returns true if key is empty (null or spaces only)
 * e.g. null => false
 *       ' ' => true
 */
exports.isEmptyKey = (key) => {
  return (!key || /^\s*$/.test(key));
};

/**
 * Returns true if key ends with slash /
 * e.g. key1//key2/key3  => false
 *      key1//key2/key3/ => true
 */
exports.isLastSlash = (key) => {
  return key ? (key.substr(-1) === '/') : false;
};

/**
 * Cleans double backslashes from key
 * Removes `svc` root folder from key
 * Returns empty string if passed null
 * e.g. key1//key2/key3 => key1/key2/key3
 */
exports.stripKeySlashes = (key) => {
  // replace all double slashes with single ones
  key = _.replace(key, /\/+\//g, '/');

  // if it starts with slash, remove it
  key = _.replace(key, /^\//, '');

  return key;
};

/**
 * Removes `svc/` root folder from key
 * Returns empty string if passed null
 * e.g. svc/key1/key2 => key1/key2
 */
exports.stripSvcRoot = (key) => {
  // if it starts with 'svc/', remove it
  return _.replace(key, /^svc\//, '');
};

/**
 * Returns true if key contains a dot at beginning of a path
 * e.g. .key1/key2/key3  => true
 *      key1/.key2/key3/ => true
 *      key1/.key2/.key3 => true
 *      key1/key2/key3 => false
 */
exports.isSecretKey = (key) => {
  return !!key && (key.startsWith('.') || (/\/\./).test(key));
};
