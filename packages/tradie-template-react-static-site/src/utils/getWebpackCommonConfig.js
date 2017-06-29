import path from 'path';
import extensionsToRegex from 'ext-to-regex';
import webpack from 'webpack';
import BabiliPlugin from 'babili-webpack-plugin';
import WatchMissingNodeModulesPlugin from 'tradie-webpack-utils/WatchMissingNodeModulesPlugin';
import trailingSlashIt from 'trailing-slash-it';
import scriptExtensions from './scriptExtensions';
import getPaths from './getPaths';

const BASE_URL = trailingSlashIt(process.env.BASE_URL || '/');

export default options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;

  const config = {
    context: paths.src,

    entry: {},

    devtool: optimize ? 'source-map' : 'eval',

    output: {
      path: paths.dest,
      filename: optimize
        ? 'scripts/[name].[chunkhash:8].js'
        : 'scripts/[name].js',
      chunkFilename: optimize
        ? 'scripts/[id].[chunkhash:8].js'
        : 'scripts/[id].js',
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

  // === pass in the BASE_URL ===

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.BASE_URL': JSON.stringify(BASE_URL)
    })
  );

  // === optimize the JS ===
  //this performs dead-code removal etc which is necessary to parse the JS as webpack leaves untranspiled import()s

  if (optimize) {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    );

    config.plugins.push(
      new BabiliPlugin(
        {},
        {
          comments: false
        }
      )
    );
  }

  return config;
};
