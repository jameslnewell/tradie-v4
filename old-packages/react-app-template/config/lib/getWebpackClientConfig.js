'use strict';
const fs = require('fs');
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const RevManifestPlugin = require('@tradie/webpack-utils/RevManifestPlugin');
const CachedDllReferencePlugin = require('@tradie/webpack-utils/CachedDllReferencePlugin');
const styleExtensions = require('./styleExtensions');
const scriptExtensions = require('./scriptExtensions');
const getPaths = require('./getPaths');
const getEslintClientConfig = require('./getEslintClientConfig');
const getBabelClientConfig = require('./getBabelClientConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;
  const manifest = options.manifest;

  const config = getWebpackCommonConfig(
    Object.assign({}, options, {
      eslint: getEslintClientConfig(options),
      babel: getBabelClientConfig(options)
    })
  );

  config.entry = {client: './client.js'};

  config.output = Object.assign({}, config.output, {
    chunkFilename: optimize ? 'client.[id].[chunkhash:8].js' : 'client.[id].js'
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false
    })
  );

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
    {
      loader: require.resolve('postcss-loader'),
      options: {
        plugins: () => [autoprefixer({browsers: 'last 2 versions, > 5%, ie >= 11'})]
      }
    }
  ];

  if (optimize) {
    config.module.rules.push({
      test: extensionsToRegex(styleExtensions),
      use: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: cssLoaders
      })
    });

    config.plugins.push(
      new ExtractTextPlugin({
        filename: optimize ? '[name].[contenthash:8].css' : 'client.css',
        allChunks: false
      })
    );
  } else {
    config.module.rules.push({
      test: extensionsToRegex(styleExtensions),
      use: [require.resolve('style-loader'), ...cssLoaders]
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
    config.plugins.push(
      new CachedDllReferencePlugin({
        manifest: paths.vendorManifestFile
      })
    );
  }

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
