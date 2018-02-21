const fs = require('fs');
const config = require('config');

const externalConfigPath = '/run/config/codekube.io/config.json';

try {
  const externalConfig = fs.readFileSync(externalConfigPath);

  config.util.extendDeep(config, JSON.parse(externalConfig));
  console.log('External config was injected from', externalConfigPath);
} catch (e) {
  console.log('No external config was injected.');
}

if (process.env.NODE_ENV === 'test') {
  config.util.extendDeep(config, require('./env/test'));
} else {
  config.util.extendDeep(config, require('./env/secrets'));
}

module.exports = config;
