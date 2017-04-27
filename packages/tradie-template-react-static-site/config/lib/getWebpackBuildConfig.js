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

module.exports = options => {
  const paths = getPaths(options.root);
  // const optimize = options.optimize;
  const manifest = options.manifest;
  const metadata = options.metadata;

  const config = getWebpackCommonConfig(
    Object.assign({}, options, {
      eslint: getEslintServerConfig(options),
      babel: getBabelServerConfig(options)
    })
  );

  if (!metadata.layout.buildPath) {
    throw new Error('Layout not found in "site.json"');
  }

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

  config.plugins.push(
    new webpack.DefinePlugin({
      __CLIENT__: false,
      __SERVER__: true
    })
  );

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
    exclude: extensionsToRegex(
      [].concat(scriptExtensions, styleExtensions, '.json')
    ),
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
  config.plugins.push(
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  );

  // === render to static HTML ====

  config.plugins.push(
    new StaticReactRenderPlugin({
      layout: metadata.layout.chunkName,
      pages: metadata.pages.map(data => data.chunkName),

      getLayoutProps: (props, context) => {
        
        const entries = [];
        const entryStyles = [];

        //add vendor entries
        if (manifest.entry.vendor) {
          entries.push(...manifest.entry.vendor);
        }

        //add page entries
        if (manifest.entry[context.pageChunk.name]) {
          entries.push(...manifest.entry[context.pageChunk.name]);
        }
        
        const layoutProps = Object.assign({}, props, {
          root: config.output.publicPath,

          scripts: {

            entry: entries
              .filter(filename => /\.js$/.test(filename))
              .map(filename => `${config.output.publicPath}${filename}`),

            async: Object.values(manifest.async)
              .filter(filename => /\.js$/.test(filename))
              .map(filename => `${config.output.publicPath}${filename}`)

          },

          styles: {
            
            entry: entries
              .filter(filename => /\.css$/.test(filename))
              .map(filename => `${config.output.publicPath}${filename}`)

          }
        });
        return layoutProps;
      },
      getPageProps: props =>
        Object.assign({}, props, {
          root: config.output.publicPath
        })
    })
  );

  return config;
};
