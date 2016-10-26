'use strict';
const clean = require('tradie-webpack-scripts').clean;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = cliOptions => requireTemplateModule('config/clean', () => ({}))
  .then(mapCliToApiOptions => mapCliToApiOptions(cliOptions))
  .then(apiOptions => clean(apiOptions))
;
