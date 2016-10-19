'use strict';
const build = require('tradie-webpack-scripts').build;
const requireTemplateModule = require('./util/requireTemplateModule');
const util = require('util')

module.exports = options => Promise.all([
  requireTemplateModule('config/createVendorConfig', () => {}).then(fn => fn(options)),
  requireTemplateModule('config/createClientConfig', () => {}).then(fn => fn(options)),
  requireTemplateModule('config/createServerConfig', () => {}).then(fn => fn(options))
])
  .then(configs => build({
    root: options.root,
    debug: options.debug,
    watch: options.watch,
    webpack: {
      vendor: configs[0],
      client: configs[1],
      server: configs[2],
    }
  }))
;
