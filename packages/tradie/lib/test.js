'use strict';
const test = require('tradie-webpack-scripts/test');
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = options => {
  return requireTemplateModule('config/createTestConfig', () => {})
    .then(fn => fn(options))
    .then(config => test({
      root: options.root,
      watch: options.watch,
      webpack: config
    }))
  ;
};
