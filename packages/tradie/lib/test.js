'use strict';
const test = require('tradie-webpack-scripts').test;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = cliOptions => requireTemplateModule('config/test', () => {})
  .then(createWebpackConfig => createWebpackConfig(cliOptions))
  .then(webpackConfig => test({
    cmd: cliOptions.cmd,
    root: cliOptions.root,
    debug: cliOptions.debug,
    watch: cliOptions.watch,
    webpack: webpackConfig
  }))
;
