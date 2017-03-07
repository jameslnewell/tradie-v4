'use strict';
const webpack = require('./lib/webpack');

module.exports = options => {
  const root = options.root;
  const optimize = options.optimize;

  return {
    webpack: {
      vendor: webpack.getVendorConfig({root, optimize}),
      client: webpack.getClientConfig({root, optimize}),
      server: webpack.getServerConfig({root, optimize})
    }
  };

};
