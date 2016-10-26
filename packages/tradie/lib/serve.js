'use strict';
const serve = require('tradie-webpack-scripts').serve;
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = cliOptions => requireTemplateModule('config/serve', () => ({}))
  .then(mapCliToApiOptions => mapCliToApiOptions(cliOptions))
  .then(apiOptions => serve(apiOptions))
;
