'use strict';
const path = require('path');
const getPaths = require('./lib/getPaths');
const getWebpackVendorConfig = require('./lib/getWebpackVendorConfig');
const getWebpackClientConfig = require('./lib/getWebpackClientConfig');
const getWebpackServerConfig = require('./lib/getWebpackServerConfig');

module.exports = options => {
  const root = options.root;
  const debug = options.debug;
  const optimize = false;
  const manifest = {};
  const paths = getPaths(root);

  return {
    debug,

    webpack: {
      vendor: getWebpackVendorConfig({root, optimize, manifest}),
      client: getWebpackClientConfig({root, optimize, manifest}),
      server: getWebpackServerConfig({root, optimize})
    },

    serverPath: path.join(paths.dest, 'server.js')

  };

};
