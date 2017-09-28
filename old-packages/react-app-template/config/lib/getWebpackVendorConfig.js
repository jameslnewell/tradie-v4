'use strict';
const fs = require('fs');
const webpack = require('webpack');
const RevManifestPlugin = require('@tradie/webpack-utils/RevManifestPlugin');
const getPaths = require('./getPaths');
const getEslintClientConfig = require('./getEslintClientConfig');
const getBabelClientConfig = require('./getBabelClientConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;
  const manifest = options.manifest;

  if (!fs.existsSync(paths.vendorEntryFile)) {
    return null;
  }

  const config = getWebpackCommonConfig(
    Object.assign({}, options, {
      eslint: getEslintClientConfig(options),
      babel: getBabelClientConfig(options)
    })
  );

  config.entry = {vendor: [paths.vendorEntryFile]};

  config.plugins.push(
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false
    })
  );

  // === configure the DLL ===

  config.output.library = optimize ? '[name]_[chunkhash:8]' : '[name]';
  config.plugins.push(
    new webpack.DllPlugin({
      path: paths.vendorManifestFile,
      name: config.output.library
    })
  );

  // === output a manifest ===

  config.plugins.push(
    new RevManifestPlugin({
      filename: 'rev-manifest.json',
      cache: manifest
    })
  );

  // === uglify ===

  if (optimize) {
    //babili + uglify gives better results and uglify is the only way to get react-devtools to be quiet about the bundle not being minified
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        output: {
          comments: false
        },
        sourceMap: true
      })
    );
  }

  return config;
};
