'use strict';
const debug = require('debug');
const MemoryFS = require('memory-fs');
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
 * @param {object}  options
 * @param {boolean} [options.watch]
 * @param {boolean} [options.virtual]
 */
class Bundler {

  constructor(config, options) {
    this.watch = options && options.watch;
    this.emitter = new EventEmitter();
    this.compiler = webpack(config);
    this.watcher = null;
    this.compiling = false;
    this.debug = debug(`tradie-webpack-scripts:bundler`);

    //use a virtual file system
    if (options && options.virtual) {
      this.compiler.outputFileSystem = new MemoryFS();
    }

    //listen for when Webpack starts compiling
    this.compiler.plugin(['run', 'watch-run'], (compilerOrWatcher, callback) => {
      this.compiling = true;
      this.emitter.emit('started');
      callback();
    });

    //TODO: "watch-close" => "stopped"

    //listen for when Webpack finishes emitting the compiled files
    this.compiler.plugin('done', stats => {
      this.compiling = false;
      this.emitter.emit('completed', stats);
    });

    //listen for when Webpack encounters an error and can't recover
    this.compiler.plugin('failed', stats => {
      this.compiling = false;
      // this.emitter.emit('error', error);
    });

    //listen for when a file is changed
    this.compiler.plugin('invalid', (file, time) => {
      this.debug(`modified: ${file}`);
    });

    //debug information
    this.emitter
      .on('started', () => this.debug(`started`))
      .on('completed', () => this.debug(`completed`))
      .on('stopped', () => this.debug(`stopped`))
    ;

  }

  isCompiling() {
    return this.compiling;
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

    if (this.watch) {

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
