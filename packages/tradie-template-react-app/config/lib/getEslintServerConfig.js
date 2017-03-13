'use strict';
const getEslintCommonConfig = require('./getEslintCommonConfig');

module.exports = options => {
  const config = getEslintCommonConfig(options);
  return Object.assign({}, config, {
    rules: {
      'no-console': 'off',
      'indent': 'off' //FIXME: where is this coming from?
    },
    extends: [].concat(config.extends)
  });
};
