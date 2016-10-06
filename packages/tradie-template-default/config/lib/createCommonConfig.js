const path = require('path');
const webpack = require('webpack');
const extensionsToRegex = require('ext-to-regex');
const ResolveShortPathPlugin = require('webpack-resolve-short-path-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = tradieConfig => {
  const loaders = [];

  //transpile project scripts with the babel loader
  if (Object.keys(tradieConfig.babel).length) {
    loaders.push(
      {
        test: extensionsToRegex(tradieConfig.script.extensions),
        include: tradieConfig.src,
        loader: 'babel-loader',
        query: Object.assign({}, tradieConfig.babel, {
          babelrc: false,
          cacheDirectory: tradieConfig.tmp
        })
      }
    );
  }

  //node and browserify loads JSON files like NodeJS does... emulate that for compatibility
  loaders.push({
    test: /\.json$/,
    loader: 'json-loader'
  });

  const plugins = [

    //enforce case sensitive paths to avoid issues between file systems
    new CaseSensitivePathsPlugin(),

    new webpack.LoaderOptionsPlugin({
      minimize: tradieConfig.optimize,
      debug: !tradieConfig.optimize
    })

  ];

  //TODO: look for loaders in tradie's and user's node_modules
  //config.resolveLoader = {root: [
  // path.join(__dirname, "node_modules")
  //]});

  return {

    entry: {},

    output: {
      path: tradieConfig.dest
    },

    resolve: {
      modules: [tradieConfig.src, 'node_modules'],
      extensions: [].concat(tradieConfig.script.extensions, '.json'),
      plugins: [
        new ResolveShortPathPlugin({rootPath: tradieConfig.src})
      ]
    },

    module: {
      loaders: loaders,
    },

    plugins: plugins

  };
}