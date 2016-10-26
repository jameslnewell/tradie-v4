'use strict';
const test = require('tradie-webpack-scripts').test;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = cliOptions => requireTemplateModule('config/test', () => {})
  .then(mapCliToApiOptions => mapCliToApiOptions(cliOptions))
  .then(apiOptions => test(apiOptions))
;
