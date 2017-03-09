'use strict';
const fs = require('fs');
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CachedDllReferencePlugin = require('tradie-webpack-utils/CachedDllReferencePlugin');
const styleExtensions = require('./styleExtensions');
const scriptExtensions = require('./scriptExtensions');
const getPaths = require('./getPaths');
const getBabelClientConfig = require('./getBabelClientConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = getWebpackCommonConfig(Object.assign({}, options, {
    babel: getBabelClientConfig(options)
  }));

  config.entry = {client: './client.js'};

  config.output = Object.assign({}, config.output, {
    chunkFilename: optimize ? 'client.[id].[chunkhash:8].js' : 'client.[id].js',
  });

  // === load the CSS ===

  const cssLoaders = [
    {
      loader: require.resolve('css-loader'),
      options: {
        modules: false,
        minimize: optimize,
        importLoaders: 1
      }
    },
    //TODO: add autoprefixer
  ];
  if (optimize) {

    config.module.rules.push({
      test: extensionsToRegex(styleExtensions),
      include: paths.src,
      use: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: cssLoaders
      })
    });

    config.plugins.push(new ExtractTextPlugin({
      filename: optimize ? '[name].[contenthash:8].css' : 'client.css',
      allChunks: false
    }))

  } else {

    config.module.rules.push({
      test: extensionsToRegex(styleExtensions),
      include: paths.src,
      use: [
        require.resolve('style-loader'),
        ...cssLoaders
      ]
    });

  }

  // === load the files ===

  config.module.rules.push({
    exclude: extensionsToRegex([].concat(scriptExtensions, styleExtensions, '.json')),
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {

          //always include the original file name for SEO benefits
          name: 'files/[name].[hash:8].[ext]',

          //emit files on the client
          emitFile: true

        }
      }
    ]
  });

  // === reference the DLL ===

  if (fs.existsSync(paths.vendorEntryFile)) {
    config.plugins.push(new CachedDllReferencePlugin({
      manifest: paths.vendorManifestFile
    }));
  }

  return config;
};
