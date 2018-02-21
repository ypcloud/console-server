const httpStatus = require('http-status');
const ConsulService = require('../services/consul.service');
const ConsulUtils = require('../utils/consul.utils');

/**
 * Get keys
 * @param req
 * @param res
 * @returns {*}
 */
exports.keys = (req, res) => {
  const key = res.locals.key;

  ConsulService.keys(key)
    .then((keys) => {
      keys = keys.map(key => ConsulUtils.stripKeySlashes(key))
        .map(key => ConsulUtils.stripSvcRoot(key))
        .filter(key => !!key)
        .filter(key => !ConsulUtils.isSecretKey(key));

      res.status(httpStatus.OK).json({
        result: true,
        data: keys
      });
    })
    // if no keys, return empty array
    .catch(() => res.status(httpStatus.NO_CONTENT).json({
      result: true,
      data: []
    }));
};

/**
 * Get key
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.get = (req, res, next) => {
  const key = res.locals.key;

  // if secret key, don't
  if (ConsulUtils.isSecretKey(key)) {
    return next(new Error('Key can not start with a dot (.)'));
  }

  // if key is folder, set value to null,
  // to avoid unexpected results
  if (ConsulUtils.isLastSlash(key)) {
    return next(new Error('Key can not end with a slash (/)'));
  }

  ConsulService.get(key)
    .then((config) => {
      res.status(httpStatus.OK).json({
        result: true,
        data: config
      });
    })
    .catch(() => next(new Error('Error getting keys')));
};

/**
 * Set key
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.set = (req, res, next) => {
  const key = res.locals.key;
  let value = req.body.config;

  // if no key, don't
  if (ConsulUtils.isEmptyKey(key)) {
    return next(new Error('Key is required'));
  }

  // if secret key, don't
  if (ConsulUtils.isSecretKey(key)) {
    return next(new Error('Key can not start with a dot (.)'));
  }

  // if key is folder, set value to null,
  // to avoid unexpected results
  if (ConsulUtils.isLastSlash(key) && value) {
    value = null;
  }

  ConsulService.set(key, value)
    .then(() => {
      res.status(httpStatus.OK).json({
        result: true,
        data: true
      });

      res.locals.event = {
        type: 'updated',
        what: `config ${key}`,
        project: res.locals.project
      };

      // next middleware: parse-consul-key
      next();
    })
    .catch(() => next(new Error('Error setting key')));
};

/**
 * Delete key
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.del = (req, res, next) => {
  const key = res.locals.key;

  // if no key, don't
  if (ConsulUtils.isEmptyKey(key)) {
    return next(new Error('Key is required'));
  }

  // if secret key, don't
  if (ConsulUtils.isSecretKey(key)) {
    return next(new Error('Key can not start with a dot (.)'));
  }

  ConsulService.del(key)
    .then(() => {
      res.status(httpStatus.OK).json({
        result: true,
        data: true
      });

      res.locals.event = {
        type: 'deleted',
        what: `config ${key}`,
        project: res.locals.project
      };

      // next middleware: parse-consul-key
      next();
    })
    .catch(() => next(new Error('Error deleting key')));
};
