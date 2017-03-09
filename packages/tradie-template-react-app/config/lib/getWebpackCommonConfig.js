'use strict';
const path = require('path');
const extensionsToRegex = require('ext-to-regex');
const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('tradie-webpack-utils/WatchMissingNodeModulesPlugin');
const scriptExtensions = require('./scriptExtensions');
const getPaths = require('./getPaths');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = {
    context: paths.src,

    entry: {},

    devtool: optimize ? 'source-map' : 'eval',

    output: {
      path: paths.dest,
      filename: optimize ? '[name].[chunkhash:8].js' : '[name].js',
      publicPath: '/',
      pathinfo: !optimize //true in dev only
    },

    module: {
      rules: [

        // === load the JS ===
        {
          test: extensionsToRegex(scriptExtensions),
          include: paths.src,
          use: {
            loader: require.resolve('babel-loader'),
            options: options.babel
          }
        }

      ]
    },

    plugins: [

      //rebuild if the user installs a missing package
      new WatchMissingNodeModulesPlugin(path.join(options.root, 'node_modules'))

    ]

  };

  // === optimize the JS ===

  if (optimize) {

    config.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }));

    config.plugins.push(new BabiliPlugin({}, {
      comments: false
    }));

  }

  return config;
};