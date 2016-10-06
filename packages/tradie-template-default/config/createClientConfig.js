'use strict';
const path = require('path');
const webpack = require('webpack');
const fileName = require('file-name');
const getTradieConfig = require('./lib/getTradieConfig');
const createAppConfig = require('./lib/createAppConfig');
const getClientBundles = require('./lib/getClientBundles');
const configureStyleLoader = require('./lib/configureStyles');
const configureAssets = require('./lib/configureAssets');

module.exports = options => {

  return getTradieConfig(options)
    .then(tradieConfig => {

      const webpackConfig = createAppConfig(tradieConfig);

      //configure the client bundles
      const clientBundles = getClientBundles(tradieConfig.script.bundles);
      webpackConfig.entry = clientBundles.reduce((accum, bundle) => {
        const key = path.join(path.dirname(bundle), fileName(bundle));
        return Object.assign({}, accum, {
          [key]: path.resolve(tradieConfig.src, bundle)
        });
      }, {});

      //create a common.js bundle for modules that are shared across multiple bundles
      if (clientBundles.length > 1) {
        webpackConfig.plugins = webpackConfig.plugins.concat([
          new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            filename: options.optimize ? '[name].[chunkhash].js' : '[name].js',
            chunks: clientBundles, //exclude modules from the vendor chunk
            minChunks: clientBundles.length //modules must be used across all the chunks to be included
          })
        ]);
      }//TODO: what about for a single page app where require.ensure is used - I want a common stuff for all chunks in the main entry point

      //use vendor modules from the vendor bundle
      if (tradieConfig.script.vendors.length > 0) {
        //chose DLLPlugin for long-term-caching based on https://github.com/webpack/webpack/issues/1315
        webpackConfig.plugins = config.plugins.concat([
          new webpack.DllReferencePlugin({
            context: tradieConfig.dest,
            manifest: require(path.join(tradieConfig.tmp, 'vendor-manifest.json')) //eslint-disable-line global-require
          })
        ]);
      }

      //stylesheets
      configureStyleLoader(tradieConfig, webpackConfig);

      //assets
      configureAssets(tradieConfig, webpackConfig);

      //configure the script filename
      let filename = options.optimize ? '[name].[chunkhash].js' : '[name].js';
      if (tradieConfig.script.outputFilename) {
        webpackConfig.output.filename = tradieConfig.script.outputFilename;
      }

      webpackConfig.target ='web';
      webpackConfig.devtool = tradieConfig.optimize ? 'hidden-source-map' : 'cheap-module-eval-source-map'; //needs to be inline-source-map for sass source maps to work

      return webpackConfig;
    })
  ;

};
