'use strict';
const getWebpackVendorConfig = require('./lib/getWebpackVendorConfig');
const getWebpackClientConfig = require('./lib/getWebpackClientConfig');
const getWebpackServerConfig = require('./lib/getWebpackServerConfig');

module.exports = options => {
  const root = options.root;
  const watch = options.watch;
  const debug = options.debug;
  const optimize = options.optimize;
  const manifest = {};

  return {
    debug,
    watch,
    webpack: {
      vendor: getWebpackVendorConfig({root, optimize, manifest}),
      client: getWebpackClientConfig({root, optimize, manifest}),
      server: getWebpackServerConfig({root, optimize})
    }
  };

};
