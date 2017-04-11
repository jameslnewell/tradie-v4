'use strict';
const getEslintCommonConfig = require('./getEslintCommonConfig');

module.exports = options => {
  const config = getEslintCommonConfig(options);
  return Object.assign({}, config, {
    env: {
      node: true
    },
    rules: {
      'no-console': 'off'
    },
    extends: [].concat(config.extends)
  });
};
