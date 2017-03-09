'use strict';
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const nodeExternals = require('webpack-node-externals');
const styleExtensions = require('./styleExtensions');
const scriptExtensions = require('./scriptExtensions');
const getPaths = require('./getPaths');
const getBabelServerConfig = require('./getBabelServerConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = getWebpackCommonConfig(Object.assign({}, options, {
    babel: getBabelServerConfig(options)
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
    test: extensionsToRegex(styleExtensions),
    include: paths.src,
    use: [require.resolve('null-loader')]
  });

  // === ignore the files ===

  config.module.rules.push({
    exclude: extensionsToRegex([].concat(scriptExtensions, styleExtensions, '.json')),
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
