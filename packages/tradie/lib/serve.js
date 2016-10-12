'use strict';
const serve = require('tradie-webpack-scripts').serve;
const requireTemplateModule = require('./util/requireTemplateModule');
const util = require('util')

module.exports = options => Promise.all([
  requireTemplateModule('config/createVendorConfig', () => {}).then(fn => fn(options)).then(config => {console.log(util.inspect(config, {depth: null})); return config;}),
  requireTemplateModule('config/createClientConfig', () => {}).then(fn => fn(options)).then(config => {console.log(util.inspect(config, {depth: null})); return config;}),
  requireTemplateModule('config/createServerConfig', () => {}).then(fn => fn(options)).then(config => {console.log(util.inspect(config, {depth: null})); return config;})
])
  .then(configs => serve({
    root: options.root,
    webpack: {
      vendor: configs[0],
      client: configs[1],
      server: configs[2],
    }
  }))
;
