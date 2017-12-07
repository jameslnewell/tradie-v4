import webpack from 'webpack';
import extensionsToRegex from 'ext-to-regex';
import nodeExternals from 'webpack-node-externals';
import StaticReactRenderPlugin from 'static-react-render-webpack-plugin';
import styleExtensions from './styleExtensions';
import scriptExtensions from './scriptExtensions';
import getEslintServerConfig from './getEslintServerConfig';
import getBabelServerConfig from './getBabelServerConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';

export default options => {
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

  config.externals = [
    nodeExternals({
      //we need to let webpack process other files, otherwise NodeJS crashes due to syntax errors parsing non-JS files
      whitelist: [new RegExp(`(\\.|\\/)(?!${scriptExtensions.join('|')}).*$`)]
    })
  ];

  // === ignore the CSS ===

  config.module.rules.push({
    test: extensionsToRegex(styleExtensions),
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
        let entryAssets = [];
        let asyncAssets = [];

        //get entry assets for the layout and this page
        if (manifest.entry.vendor) {
          entryAssets.push(...manifest.entry.vendor);
        }
        if (manifest.entry[context.pageChunk.name]) {
          entryAssets.push(...manifest.entry[context.pageChunk.name]);
        }
        entryAssets = entryAssets.map(filename => `${config.output.publicPath}${filename}`);

        //get async assets for the layout and this page
        if (manifest.async.vendor) {
          asyncAssets.push(...manifest.entry.vendor);
        }
        if (manifest.async[context.pageChunk.name]) {
          asyncAssets.push(...manifest.async[context.pageChunk.name]);
        }
        asyncAssets = asyncAssets.map(filename => `${config.output.publicPath}${filename}`);

        const layoutProps = Object.assign({}, props, {
          root: config.output.publicPath,

          scripts: {
            entry: entryAssets.filter(filename => /\.js$/.test(filename)),

            async: entryAssets.filter(filename => /\.js$/.test(filename))
          },

          styles: {
            entry: entryAssets.filter(filename => /\.css$/.test(filename))
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
