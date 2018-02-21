const ConsulUtils = require('../utils/consul.utils');

exports.parseConsulKey = (req, res, next) => {
  res.locals.key = ConsulUtils.stripKeySlashes(req.params[0]);

  const splitKey = res.locals.key.split('/');
  const first = splitKey[0];
  const second = splitKey[1];

  res.locals.project = {
    owner: first,
    repo: (splitKey.length > 2) ? second : undefined // if we have PROJ/REPO/ or PROJ/REPO/xxx/..., consider it a repo
  };

  next();
};
