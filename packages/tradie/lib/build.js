'use strict';
const build = require('tradie-webpack-scripts').build;
const requireTemplateModule = require('./util/requireTemplateModule');
const util = require('util')

module.exports = cliOptions => requireTemplateModule('config/build', () => ({}))
  .then(createWebpackConfigs => createWebpackConfigs(cliOptions))
  .then(webpackConfigs => build({
    cmd: cliOptions.cmd,
    root: cliOptions.root,
    debug: cliOptions.debug,
    watch: cliOptions.watch,
    webpack: webpackConfigs
  }))
;
