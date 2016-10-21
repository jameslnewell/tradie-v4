'use strict';
const test = require('tradie-webpack-scripts').test;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = options => requireTemplateModule('config/createTestConfig', () => {})
  .then(fn => fn(options))
  .then(config => test({
    cmd: options.cmd,
    root: options.root,
    debug: options.debug,
    watch: options.watch,
    webpack: config
  }))
;
