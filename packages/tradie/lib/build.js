'use strict';
const build = require('tradie-webpack-scripts/build');
const requireTemplateModule = require('./util/requireTemplateModule');

module.exports = options => {
  console.log(options);

  return Promise.all([
    requireTemplateModule('config/createVendorConfig', () => {}).then(fn => fn(options)),
    requireTemplateModule('config/createClientConfig', () => {}).then(fn => fn(options)),
    requireTemplateModule('config/createServerConfig', () => {}).then(fn => fn(options))
  ])
    .then(configs => build({
      root: options.root,
      watch: options.watch,
      webpack: {
        vendor: configs[0],
        client: configs[1],
        server: configs[2],
      }
    }))
  ;
};
