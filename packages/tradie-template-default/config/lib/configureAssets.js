'use strict';
const extensionsToRegex = require('ext-to-regex');

module.exports = function configureAssets(tradieConfig, webpackConfig) {

  //configure the asset filename
  let filename = 'files/[hash].[ext]'; //optimize ? '[path][name].[hash].js' :
  // '[path][name].[ext]'
  if (tradieConfig.asset.outputFilename) {
    filename = tradieConfig.asset.outputFilename;
  }

  webpackConfig.module.loaders.push({
    test: extensionsToRegex(tradieConfig.asset.extensions),
    loader: 'file-loader',
    query: {name: filename}
  });

};
