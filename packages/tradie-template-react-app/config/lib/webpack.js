'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const babel = require('./babel');

const jsExtensions = ['.js', '.jsx'];
const cssExtensions = ['.css'];

const getPaths = root => ({
  src: path.resolve(root, './src'),
  dest: path.resolve(root, './dist'),
  tmp: path.resolve(root, './tmp')
});

//TODO: service worker
//TODO: env vars
//TODO: dead code removal on server, after webpack bundled
//TODO: list assets in file for preload and fingerprinting // config.plugins.push(new AsyncAssetPlugin());
//TODO: eslint, stylelint
//TODO: WatchMissingNodeModulesPlugin
//TODO: start and shutdown server when app is served
//TODO: compiles heaps of times when starting

class AsyncAssetPlugin {
  apply(compiler) {
    compiler.plugin('compilation', compilation => {

      const publicPath = compilation.outputOptions.publicPath;

      compiler.plugin('done', stats => {
        const json = stats.toJson();

        let asyncChunks = json.chunks
            .filter(chunk => !chunk.initial)//TODO: exclude /\.hot-update\.js$/
            .map(chunk => chunk.files)
          ;

        asyncChunks = asyncChunks.concat.apply([], asyncChunks)
          .map(asyncChunk => `${publicPath}${asyncChunk}`)
        ;

        fs.writeFileSync(path.join(dest, 'async-scripts.json'), JSON.stringify(asyncChunks));

      });
    });
  }
}

const getVendorEntry = paths => path.join(paths.src, 'vendor.js');
const getVendorManifest = paths => path.join(paths.tmp, 'vendor.json');

const uglify = config => {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,
      warnings: false
    },
    mangle: {
      screw_ie8: true
    },
    output: {
      comments: false,
      screw_ie8: true
    },
    sourceMap: false
  }));
};

const getCommonConfig = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = {
    context: paths.src,

    entry: {},

    output: {
      path: paths.dest,
      filename: optimize ? '[name].[chunkhash:8].js' : '[name].js',
      publicPath: '/',
      pathinfo: true //true in dev only
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

    ]

  };

  // === optimize the JS ===

  if (optimize) {

    config.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
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

    config.output.library = optimize ? '[name]' : '[name]_[chunkhash:8]';
    config.plugins.push(new webpack.DllPlugin({
      path: getVendorManifest(paths),
      name: config.output.library
    }));

    // === optimize the JS ===

    if (optimize) {
      uglify(config);
    }

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

  // === optimize the JS ===

  if (optimize) {
    uglify(config);
  }

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

          emitFile: true

        }
      }
    ]
  });

  // === reference the DLL ===

  const vendorEntry = getVendorEntry(paths);
  if (fs.existsSync(vendorEntry)) {
    config.plugins.push(new webpack.DllReferencePlugin({
      context: paths.src,
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
