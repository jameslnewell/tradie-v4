'use strict';
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const nodeExternals = require('webpack-node-externals');
const StaticReactRenderPlugin = require('static-react-render-webpack-plugin');
const styleExtensions = require('./styleExtensions');
const scriptExtensions = require('./scriptExtensions');
const getPaths = require('./getPaths');
const getEslintServerConfig = require('./getEslintServerConfig');
const getBabelServerConfig = require('./getBabelServerConfig');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');
const getInitialChunkFiles = require('./getInitialChunkFiles');

module.exports = options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;
  const manifest = options.manifest;
  const metadata = options.metadata;

  const config = getWebpackCommonConfig(Object.assign({}, options, {
    eslint: getEslintServerConfig(options),
    babel: getBabelServerConfig(options)
  }));

  config.entry = {
    layout: metadata.layout.buildPath
  };
  metadata.pages.forEach(pageMeta => {
    config.entry[pageMeta.chunkName] = pageMeta.buildPath;
  });
  
  config.output = Object.assign(config.output, {
    filename: '[name].js',
    libraryTarget: 'commonjs'
  });

  config.plugins.push(new webpack.DefinePlugin({
    '__CLIENT__': false,
    '__SERVER__': true
  }));

  config.devtool = 'cheap-inline-source-map';

  config.target = 'node';

  config.node = {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
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

  // === render to static HTML ====

  config.plugins.push(new StaticReactRenderPlugin({

    layout: metadata.layout.chunkName,
    pages: metadata.pages.map(data => data.chunkName),

    getLayoutProps: (props, context) => {
      console.log('manifest', manifest);
      return Object.assign({}, props, {
        
        root: config.output.publicPath,
        
        //TODO: only fetch scripts matching the chunk name and vendor chunk
        scripts: {
          entry: [...manifest.entry['vendor'], ...manifest.entry[context.pageChunk.name]]
            .filter(filename => /\.js$/.test(filename))
            .map(filename => `${config.output.publicPath}${filename}`)
          ,
          async: Object.values(manifest.async)
            .filter(filename => /\.js$/.test(filename))
            .map(filename => `${config.output.publicPath}${filename}`)
          ,
        },

        //TODO: only fetch scripts matching the chunk name and vendor chunk
        styles: [...manifest.entry['vendor'], ...manifest.entry[context.pageChunk.name]]
          .filter(filename => /\.css$/.test(filename))
          .map(filename => `${config.output.publicPath}${filename}`)
        
        
      });
    },

    getPageProps: (props, context) => {
      return Object.assign({}, props, {
        root: config.output.publicPath,
      });
    },

  }))

  return config;
};
