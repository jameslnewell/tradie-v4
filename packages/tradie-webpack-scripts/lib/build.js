'use strict';
const webpack = require('webpack');
const BuildReporter = require('./util/BuildReporter');
const runWebpack = require('./util/runWebpack');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object} options
 * @param {boolean} [options.watch]
 * @param {object} [options.webpack]
 * @param {object} [options.webpack.vendor]
 * @param {object} [options.webpack.client]
 * @param {object} [options.webpack.server]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  const reporter = new BuildReporter();

  const createVendorBundle = () => {
    if (options.webpack.vendor) {
      const compiler = webpack(options.webpack.vendor);
      reporter.observe(compiler);
      return runWebpack(false, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const createClientBundle = () => {
    if (options.webpack.client) {
      const compiler = webpack(options.webpack.client);
      reporter.observe(compiler);
      return runWebpack(options.watch, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const createServerBundle = () => {
    if (options.webpack.server) {
      const compiler = webpack(options.webpack.server);
      reporter.observe(compiler);
      return runWebpack(options.watch, compiler);
    } else {
      return Promise.resolve();
    }
  };

  return Promise.all([
    createServerBundle(),
    createVendorBundle()
      .then(() => createClientBundle())
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
