'use strict';
const debug = require('debug');
const connect = require('connect');
const serverDestroy = require('server-destroy');
const detectPort = require('detect-port');
const EventEmitter = require('events').EventEmitter;

class Server {

  constructor() {

    this.debug = debug(`tradie-webpack-scripts:server`);
    this.app = connect();
    this.server = null;
    this.emitter = new EventEmitter();

    //debug information
    this.emitter
      .on('started', () => this.debug(`started`))
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

  use(url, middleware) {
    this.app.use(url, middleware);
    return this;
  }

  /**
   * @returns {Promise}
   */
  start() {
    return new Promise((resolve, reject) => {
      detectPort(3000)
        .then(port => {
          this.server = this.app.listen(port, error => {
            if (error) {
              this.emitter.emit('error', error);
              reject(error);
            } else {
              this.emitter.emit('started', 'localhost', port);
              resolve();
            }
          });
          serverDestroy(this.server);
        })
        .catch(error => {
          this.emitter.emit('error', error);
          reject(error);
        })
      ;
    });
  }

  /**
   * @returns {Promise}
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.destroy(error => {
          if (error) {
            this.emitter.emit('error', error);
            reject(error);
          } else {
            this.server = null;
            this.emitter.emit('stopped');
            resolve();
          }
        });
      } else {
        this.emitter.emit('stopped');
        resolve();
      }
    });
  }

}

module.exports = Server;
