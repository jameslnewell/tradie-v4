'use strict';
const path = require('path');
const extensionsToRegex = require('ext-to-regex');
const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('tradie-webpack-utils/WatchMissingNodeModulesPlugin');
const trailingSlashIt = require('trailing-slash-it');
const scriptExtensions = require('./scriptExtensions');
const getPaths = require('./getPaths');

const BASE_URL = trailingSlashIt(process.env.BASE_URL || '/');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = {
    context: paths.src,

    entry: {},

    devtool: optimize ? 'source-map' : 'eval',

    output: {
      path: paths.dest,
      filename: optimize ? 'scripts/[name].[chunkhash:8].js' : 'scripts/[name].js',
      chunkFilename: optimize ? 'scripts/[id].[chunkhash:8].js' : 'scripts/[id].js',
      sourceMapFilename: '[file].map',
      publicPath: BASE_URL,
      pathinfo: !optimize //true in dev only
    },

    resolve: {
      extensions: [...scriptExtensions, '.json']
    },

    module: {
      rules: [

        // === load the JS ===
        {
          enforce: 'pre',
          test: extensionsToRegex(scriptExtensions),
          include: paths.src,
          loader: require.resolve('eslint-loader'),
          options: {
            baseConfig: options.eslint,
            useEslintrc: false
          }
        },
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

  // === pass in the BASE_URL ===

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.BASE_URL': JSON.stringify(BASE_URL)
  }));


  return config;
};
