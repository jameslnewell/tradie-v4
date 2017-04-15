'use strict';
const EventEmitter = require('events').EventEmitter;
const fork = require('child_process').fork;
const debug = require('debug');

class Process {
  constructor(path, options) {
    this.path = path;
    this.options = options || {};

    this.debug = debug(`tradie-webpack-scripts:server`);
    this.emitter = new EventEmitter();
    this.process = null;

    this.onExit = this.onExit.bind(this);
    this.onError = this.onError.bind(this);
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

  /** @private **/
  onExit(code) {
    if (code === null || code === 0) {
      this.emitter.emit('stopped');
    } else {
      this.emitter.emit('error', new Error(`App exited with code "${code}"`));
    }
    this.process = null;
  }

  /** @private **/
  onError(error) {
    this.emitter.emit('error', error);
  }

  /**
   * @returns {Promise}
   */
  start() {
    return new Promise(resolve => {
      if (this.process) {
        resolve();
        return;
      }

      this.process = fork(this.path, {
        env: Object.assign({}, process.env, this.options.env || {})
      });

      this.process.on('exit', this.onExit).on('error', this.onError);

      resolve();
    });
  }

  /**
   * @returns {Promise}
   */
  stop() {
    return new Promise(resolve => {
      if (this.process) {
        this.process.kill();
      }
      resolve();
    });
  }
}

module.exports = Process;
