/* @flow weak */
'use strict';
const createTestConfig = require('./lib/createTestConfig');

module.exports = cliOptions => createTestConfig(cliOptions)
  .then(webpackConfig => ({
    root: cliOptions.root,
    debug: cliOptions.debug,
    watch: cliOptions.watch,
    webpack: webpackConfig
  }))
;