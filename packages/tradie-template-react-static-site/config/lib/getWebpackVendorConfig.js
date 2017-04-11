'use strict';
const fs = require('fs');
const webpack = require('webpack');
const CollectFilesPlugin = require('tradie-webpack-utils/CollectFilesPlugin');
const getPaths = require('./getPaths');
const getEslintClientConfig = require('./getEslintClientConfig');
const getBabelClientConfig = require('./getBabelClientConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;
  const manifest = options.manifest;

  if (fs.existsSync(paths.vendorEntryFile)) {

    const config = getWebpackCommonConfig(Object.assign({}, options, {
      eslint: getEslintClientConfig(options),
      babel: getBabelClientConfig(options)
    }));

    config.entry = {vendor: [paths.vendorEntryFile]};

    config.plugins.push(new webpack.DefinePlugin({
      '__CLIENT__': true,
      '__SERVER__': false
    }));

    // === configure the DLL ===

    config.output.library = optimize ? '[name]_[chunkhash:8]' : '[name]';
    config.plugins.push(new webpack.DllPlugin({
      path: paths.vendorManifestFile,
      name: config.output.library
    }));

  // === collect files ===

  config.plugins.push(new CollectFilesPlugin({
    cache: manifest
  }));

    return config;
  }

};
