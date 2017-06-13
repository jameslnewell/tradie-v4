const path = require('path');
const jestUtils = require('tradie-jest-utils');

module.exports = function(options = {}) {
  return {
    jest: {
      watch: options.watch,
      coverage: options.coverage,
      config: {
        rootDir: path.resolve('./src'),
        transform: {
          '.jsx?$': require.resolve('../lib/jest/babelTransform')
        }
      }
    }
  };
};
