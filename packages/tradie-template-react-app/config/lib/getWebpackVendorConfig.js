'use strict';
const fs = require('fs');
const webpack = require('webpack');
const getPaths = require('./getPaths');
const getBabelClientConfig = require('./getBabelClientConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  if (fs.existsSync(paths.vendorEntryFile)) {

    const config = getWebpackCommonConfig(Object.assign({}, options, {
      babel: getBabelClientConfig(options)
    }));

    config.entry = {vendor: [paths.vendorEntryFile]};

    // === configure the DLL ===

    config.output.library = optimize ? '[name]_[chunkhash:8]' : '[name]';
    config.plugins.push(new webpack.DllPlugin({
      path: paths.vendorManifestFile,
      name: config.output.library
    }));

    return config;
  }

};