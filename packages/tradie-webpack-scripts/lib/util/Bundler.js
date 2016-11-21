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
 *  - complete - emitted when a compilation has been completed
 *  - stop - emitted when the bundler has been stopped
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
      this.emitter.emit('started');
    });

    this.compiler.plugin('done', stats => {
      this.emitter.emit('completed', stats);
    });

    //debug information
    this.emitter
      .on('started', () => this.debug(`started`))
      .on('completed', () => this.debug(`completed`))
      .on('stopped', () => this.debug(`stopped`))
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

  start() {

    if (this.watching) {

      //compile in watch mode
      this.watcher = this.compiler.watch({}, error => {
        if (error) {
          this.emitter.emit('error', error);
        }
      });

    } else {

      //compile in run mode
      this.compiler.run(error => {
        if (error) {
          this.emitter.emit('error', error);
        } else {
          this.emitter.emit('stopped');
        }
      });

    }

    return this;
  }

  stop() {
    if (this.watcher) {
      this.watcher.close(() => this.emitter.emit('stopped'));
    } else {
      this.emitter.emit('stopped');
    }
    return this;
  }

}

module.exports = Bundler;
