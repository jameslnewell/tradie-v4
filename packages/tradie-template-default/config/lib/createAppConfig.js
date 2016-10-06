'use strict';
const webpack = require('webpack');
const createCommonBundleConfig = require('./createCommonConfig');


module.exports = function createApplicationConfig(tradieConfig) {
  const webpackConfig = createCommonBundleConfig(tradieConfig);

  //plugins
  if (tradieConfig.optimize) {

    webpackConfig.plugins = webpackConfig.plugins.concat([

      //set env so non-prod code can be removed by uglify-js
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),

      // new webpack.optimize.OccurrenceOrderPlugin(), //no longer needed and is on by defaul  https://gist.github.com/sokra/27b24881210b56bbaff7#occurrence-order
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
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
        }
      })

    ]);

  }

  return webpackConfig;
};
