'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const BabiliPlugin = require("babili-webpack-plugin");
const CachedDllReferencePlugin = require('tradie-webpack-utils/CachedDllReferencePlugin');
const WatchMissingNodeModulesPlugin = require('tradie-webpack-utils/WatchMissingNodeModulesPlugin');
const babel = require('./babel');

const jsExtensions = ['.js', '.jsx'];
const cssExtensions = ['.css'];

const getPaths = root => ({
  src: path.resolve(root, './src'),
  dest: path.resolve(root, './dist'),
  tmp: path.resolve(root, './tmp')
});

//TODO: dead code removal on server, after webpack bundled
//TODO: baseurl
//TODO: service worker
//TODO: env vars
//TODO: list assets in file for preload and fingerprinting // config.plugins.push(new AssetManifestPlugin());
//TODO: eslint, stylelint
//TODO: start and shutdown server when app is served
//TODO: support enzyme and sinon
//TODO: add autoprefixer

const getVendorEntry = paths => path.join(paths.src, 'vendor.js');
const getVendorManifest = paths => path.join(paths.tmp, 'vendor.json');

const getCommonConfig = options => {
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
          test: extensionsToRegex(jsExtensions),
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

module.exports.getVendorConfig = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const vendorEntry = getVendorEntry(paths);
  if (fs.existsSync(vendorEntry)) {

    const config = getCommonConfig(Object.assign({}, options, {
      babel: babel.getClientConfig(options)
    }));

    config.entry = {vendor: [vendorEntry]};

    // === configure the DLL ===

    config.output.library = optimize ? '[name]_[chunkhash:8]' : '[name]';
    config.plugins.push(new webpack.DllPlugin({
      path: getVendorManifest(paths),
      name: config.output.library
    }));

    return config;
  }

};

module.exports.getClientConfig = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = getCommonConfig(Object.assign({}, options, {
    babel: babel.getClientConfig(options)
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
      test: extensionsToRegex(cssExtensions),
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
      test: extensionsToRegex(cssExtensions),
      include: paths.src,
      use: [
        require.resolve('style-loader'),
        ...cssLoaders
      ]
    });

  }

  // === load the files ===

  config.module.rules.push({
    exclude: extensionsToRegex([].concat(jsExtensions, cssExtensions, '.json')),
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

  const vendorEntry = getVendorEntry(paths);
  if (fs.existsSync(vendorEntry)) {
    config.plugins.push(new CachedDllReferencePlugin({
      manifest: getVendorManifest(paths)
    }));
  }

  return config;
};

module.exports.getServerConfig = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = getCommonConfig(Object.assign({}, options, {
    babel: babel.getServerConfig(options)
  }));

  config.entry = {server: './server.js'};
  config.output = Object.assign(config.output, {
    filename: '[name].js'
  });

  config.target = 'node';

  config.node = {
    __filename: false,
    __dirname: false
  };

  config.externals = [nodeExternals()];

  // === ignore the CSS ===

  config.module.rules.push({
    test: extensionsToRegex(cssExtensions),
    include: paths.src,
    use: [require.resolve('null-loader')]
  });

  // === ignore the files ===

  config.module.rules.push({
    exclude: extensionsToRegex([].concat(jsExtensions, cssExtensions, '.json')),
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {

          //always include the original file name for SEO benefits
          name: 'files/[name].[hash:8].[ext]',

          //already emitted on the client
          emitFile: false

        }
      }
    ]
  });

  //ignore code-splitting points on the server
  config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1
  }));

  return config;
};
