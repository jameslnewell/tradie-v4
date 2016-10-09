const path = require('path');
const webpack = require('webpack');
const ResolveShortPathPlugin = require('webpack-resolve-short-path-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WebpackConfigBuilder = require('tradie-webpack-config');

module.exports = tradieConfig => {

  const builder = new WebpackConfigBuilder({
    root: tradieConfig.root,
    src: tradieConfig.src,
    tmp: tradieConfig.tmp,
    dest: tradieConfig.dest
  });

  builder.configureScripts({
    babel: tradieConfig.babel,
    extensions: tradieConfig.script.extensions
  });

  builder.configureJson();

  //enforce case sensitive paths to avoid issues between file systems
  builder.plugin(new CaseSensitivePathsPlugin());

  builder.plugin(new webpack.LoaderOptionsPlugin({
    minimize: tradieConfig.optimize,
    debug: !tradieConfig.optimize
  }));

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