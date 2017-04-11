'use strict';
const getEslintCommonConfig = require('./getEslintCommonConfig');

module.exports = options => {
  const config = getEslintCommonConfig(options);
  return Object.assign({}, config, {
    env: {
      browser: true
    },
    globals: Object.assign(config.globals, {
      process: false
    }),
    extends: [].concat(config.extends)
  });
};
