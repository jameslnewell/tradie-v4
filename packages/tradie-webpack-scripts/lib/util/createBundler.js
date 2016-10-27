/* @flow weak */
'use strict';
const webpack = require('webpack');

/**
 * Creates a wrapper around Webpack's run/watch method
 * @param {object}  config
 * @param {object}  [options]
 * @param {boolean} [options.watch]
 * @param {object}  [opttions.reporter]
 */
module.exports = (config, options) => {
  let watcher;
  const compiler = webpack(config);

  //hook the reporter up
  if (options.reporter) {
    options.reporter.observe(compiler);
  }

  return {

    plugin() {
      const args = Array.prototype.splice.call(arguments, 0);
      return compiler.plugin.apply(compiler, args);
    },

    invalidate() {
      if (watcher) {
        watcher.invalidate();
      }
      return this;
    },

    /**
     * Run the bundler
     * @returns {Promise}
     */
    run() {
      return new Promise((resolve, reject) => {

        if (options && options.watch) {

          //compile in watch mode
          watcher = compiler.watch({}, error => {
            if (error) {
              console.error(error);
              reject();
            }
          });

          //stop watching and exit when the user presses CTL-C
          process.on('SIGINT', () => {
            watcher.close(() => resolve());
          });


        } else {

          //compile in run mode
          compiler.run(error => {
            if (error) {
              console.error(error);
              reject();
            } else {
              resolve();
            }
          });

        }

      });
    }

  };

};
