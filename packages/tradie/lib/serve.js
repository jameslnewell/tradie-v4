'use strict';
const serve = require('tradie-webpack-scripts').serve;
const requireTemplateModule = require('./util/requireTemplateModule');
const util = require('util')

module.exports = options => Promise.all([
  requireTemplateModule('config/createVendorConfig', () => {}).then(fn => fn(options)),
  requireTemplateModule('config/createClientConfig', () => {}).then(fn => fn(options)),
  requireTemplateModule('config/createServerConfig', () => {}).then(fn => fn(options))
])
  .then(configs => serve({
    root: options.root,
    debug: options.debug,
    webpack: {
      vendor: configs[0],
      client: configs[1],
      server: configs[2],
    }
  }))
;
