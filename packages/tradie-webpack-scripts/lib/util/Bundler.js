/* @flow weak */
'use strict';
const debug = require('debug');
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
class Bundler {

  constructor(config, options) {
    this.debug = debug(`tradie-webpack-scripts:bundler:${options.name}`);
    this.emitter = new EventEmitter();
    this.compiler = webpack(config);
    this.watcher = null;
    this.name = options && options.name || '';
    this.watching = options && options.watch;

    this.compiler.plugin('compile', () => {
      this.emitter.emit('start');
    });

    this.compiler.plugin('done', stats => {
      this.emitter.emit('finish', stats);
    });

    //debug information
    this.emitter
      .on('start', () => this.debug(`starting`))
      .on('finish', () => this.debug(`finished`))
      .on('close', () => this.debug(`closed`))
    ;

  }

  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }

  once(event, handler) {
    this.emitter.once(event, handler);
    return this;
  }

  off(event, handler) {
    this.emitter.removeListener(event, handler);
    return this;
  }

  invalidate() {
    if (this.watcher) {
      this.watcher.invalidate();
    }
    return this;
  }

  run() {

    if (this.watching) {

      //compile in watch mode
      this.watcher = this.compiler.watch({}, error => {
        if (error) {
          this.emitter.emit('error', error);
        }
      });

      //stop watching and exit when the user presses CTL-C
      process.on('SIGINT', () => {
        this.watcher.close(() => this.emitter.emit('close'));
      });


    } else {

      //compile in run mode
      this.compiler.run(error => {
        if (error) {
          this.emitter.emit('error', error);
        } else {
          this.emitter.emit('close');
        }
      });

    }

    return this;
  }

}

module.exports = Bundler;
