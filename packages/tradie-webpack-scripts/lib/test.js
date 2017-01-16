'use strict';
const wfe = require('wait-for-event');
const Bundler = require('./util/Bundler');
const BuildReporter = require('./util/BuildReporter');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object}  options
 * @param {string}  [options.root]
 * @param {boolean} [options.debug=false]
 * @param {boolean} [options.watch=false]
 * @param {object}  options.webpack
 * @returns {Promise.<null>}
 */
module.exports = options => new Promise((resolve, reject) => {

  //create the test bundler
  const bundler = new Bundler(options.webpack, {
    name: 'test',
    watch: options.watch,
    virtual: true
  });

  //create the reporter
  const reporter = new BuildReporter({
    debug: options.debug,
    bundlers: [bundler]
  });

  //start the bundler
  bundler.start();

  //stop all the things when the user wants to exit
  process.on('SIGINT', () => {
    bundler.stop();
  });

  //wait for the bundler to close before resolving or rejecting
  return new Promise((resolve, reject) => {
    wfe.waitForAll('stopped', [bundler], errors => {
      setImmediate(() => { //HACK: wait for build-reporter
        if (errors.length) {
          reject(errors);
        } else if (reporter.errors.length) {
          reject();
        } else {
          resolve();
        }
      });
    });
  });

});
