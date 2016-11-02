'use strict';
const debug = require('debug');
const chalk = require('chalk');
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
    return
  }

  run() {

    //start the server on a free port
    detectPort(3000)
      .then(port => {
        this.server = this.app.listen(port, error => {
          if (error) {
            this.emitter.emit(error);
          } else {
            console.log(chalk.blue(`Server running at http://localhost:${port}`)); //TODO: move logging somewhere else?
          }
        });
      })
      .catch(error => {
        this.emitter.emit(error);
      })
    ;

    //close the server when the user presses CTL-C
    process.on('SIGINT', () => {
      if (server) {
        console.log('closing');
        server.close(error => {
          console.log('closed', error);
          if (error) {
            this.emitter.emit(error);
          } else {
            this.emitter.emit('close');
          }
        });
        console.log('closing started');
      }
    });

  }

}

module.exports = Server;
