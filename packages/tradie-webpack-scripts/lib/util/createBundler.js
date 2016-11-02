/* @flow weak */
'use strict';
const webpack = require('webpack');
const EventEmitter = require('events').EventEmitter;

/**
 * Creates a wrapper around Webpack's run/watch method
 *
 * Events:
 *  - start - emitted when a compilation has started
 *  - finish - emitted when a compilation has finished
 *  - close - emitted when the bundler has been closed
 *
 * @param {object}  config
 * @param {object}  [options]
 * @param {string}  [options.name]
 * @param {boolean} [options.watch]
 */
module.exports = (config, options) => {
  let watcher;
  const compiler = webpack(config);
  const emitter = new EventEmitter();

  compiler.plugin('compile', () => {
    emitter.emit('start');
  });

  compiler.plugin('done', stats => {
    emitter.emit('finish', stats);
  });

  return {

    name: options.name,

    on(event, handler) {
      emitter.on(event, handler);
      return this;
    },

    once(event, handler) {
      emitter.once(event, handler);
      return this;
    },

    off(event, handler) {
      emitter.removeListener(event, handler);
      return this;
    },

    invalidate() {
      if (watcher) {
        watcher.invalidate();
      }
      return this;
    },

    run() {

      if (options && options.watch) {

        //compile in watch mode
        watcher = compiler.watch({}, error => {
          if (error) {
            emitter.emit('error', error);
          }
        });

        //stop watching and exit when the user presses CTL-C
        process.on('SIGINT', () => {
          watcher.close(() => emitter.emit('close'));
        });


      } else {

        //compile in run mode
        compiler.run(error => {
          if (error) {
            emitter.emit('error', error);
          } else {
            emitter.emit('close');
          }
        });

      }

      return this;
    }

  };

};
