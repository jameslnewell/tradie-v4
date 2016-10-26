'use strict';
const webpack = require('webpack');
const BuildReporter = require('./util/BuildReporter');
const configureClientHMR = require('./util/configureClientHMR');
const configureServerHMR = require('./util/configureServerHMR');
const runWebpack = require('./util/runWebpack');
const runWebpackServer = require('./util/runWebpackServer');

/**
 * Run webpack dev-server on multiple bundles and display the results
 * @param {object} options
 * @param {boolean} [options.debug=false]
 * @param {object}  options.webpack
 * @param {object}  [options.webpack.vendor]
 * @param {object}  [options.webpack.client]
 * @param {object}  [options.webpack.server]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  const reporter = new BuildReporter({debug: options.debug});

  const createVendorBundle = () => {
    if (options.webpack.vendor) {
      const compiler = webpack(options.webpack.vendor);
      reporter.observe(compiler);
      return runWebpack(false, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const startClientBundle = () => {
    const config = options.webpack.client;
    console.log('starting client');
    if (config) {
      configureClientHMR(config);
      const compiler = webpack(config);
      reporter.observe(compiler);
      return runWebpackServer({
        publicDir: config.output.path,
        publicUrl: config.output.publicPath
      }, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const startServerBundle = () => {
    const config = options.webpack.server;
    if (config) {
      configureServerHMR(config);
      const compiler = webpack(config);
      reporter.observe(compiler);
      return runWebpack(true, compiler);
    } else {
      return Promise.resolve();
    }
  };

  return Promise.all([
    startServerBundle(),
    createVendorBundle()
      .then(() => startClientBundle())
  ])

    //FIXME: hack to wait for BuildReporter to finish reporting
    .then(() => new Promise((resolve, reject) => setImmediate(() => {
      if (!options.watch && reporter.errors.length) {
        reject();
      } else {
        resolve();
      }
    })))

  ;

};
