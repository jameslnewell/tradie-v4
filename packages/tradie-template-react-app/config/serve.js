'use strict';
const path = require('path');
const getPaths = require('./lib/getPaths');
const getWebpackVendorConfig = require('./lib/getWebpackVendorConfig');
const getWebpackClientConfig = require('./lib/getWebpackClientConfig');
const getWebpackServerConfig = require('./lib/getWebpackServerConfig');

module.exports = options => {
  const root = options.root;
  const optimize = false;
  const paths = getPaths(root);

  return {

    webpack: {
      vendor: getWebpackVendorConfig({root, optimize}),
      client: getWebpackClientConfig({root, optimize}),
      server: getWebpackServerConfig({root, optimize})
    },

    serverPath: path.join(paths.dest, 'server.js')

  };

};
