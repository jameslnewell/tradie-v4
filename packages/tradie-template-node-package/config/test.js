const path = require('path');
const jestUtils = require('tradie-utils-jest');

module.exports = function(options = {}) {
  return {
    jest: {
      watch: options.watch,
      coverage: options.coverage,
      config: {
        testEnvironment: 'node',
        rootDir: path.resolve('./src'),
        transform: {
          '.jsx?$': require.resolve('../lib/jest/babelTransform')
        }
      }
    }
  };
};
