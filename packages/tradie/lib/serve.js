'use strict';
const serve = require('tradie-webpack-scripts').serve;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = cliOptions => requireTemplateModule('config/serve', () => ({}))
  .then(createWebpackConfigs => createWebpackConfigs(cliOptions))
  .then(webpackConfigs => serve({
    cmd: cliOptions.cmd,
    root: cliOptions.root,
    debug: cliOptions.debug,
    webpack: webpackConfigs
  }))
;
