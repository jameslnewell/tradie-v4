'use strict';
const debug = require('debug');
const connect = require('connect');
const detectPort = require('detect-port');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const EventEmitter = require('events').EventEmitter;

class Server {

  constructor() {

    this.debug = debug(`tradie-webpack-scripts:server`);
    this.app = connect();
    this.server = null;
    this.emitter = new EventEmitter();

    //setup the server
   this.app
      .use(serveStatic('./dist')) //FIXME: configure directory
      .use(serveIndex('./dist')) //FIXME: configure directory
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
        this.server.close(error => {
          if (error) {
            this.emitter.emit('error', error);
            reject(error);
          } else {
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
