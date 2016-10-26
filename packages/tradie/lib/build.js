'use strict';
const build = require('tradie-webpack-scripts').build;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = cliOptions => requireTemplateModule('config/build', () => ({}))
  .then(mapCliToApiOptions => mapCliToApiOptions(cliOptions))
  .then(apiOptions => build(apiOptions))
;
