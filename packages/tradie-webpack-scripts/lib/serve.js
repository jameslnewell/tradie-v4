/* @flow weak */
'use strict';
const wfe = require('wait-for-event');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const Server = require('./util/Server');
const Bundler = require('./util/Bundler');
const BuildReporter = require('./util/BuildReporter');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object} options
 * @param {boolean}   [options.debug=false]
 * @param {object}    options.webpack
 * @param {object}    [options.webpack.vendor]
 * @param {object}    [options.webpack.client]
 * @param {object}    [options.webpack.build]
 * @param {object}    [options.webpack.server]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  const bundlers = {};
  let exiting = false;
  let hotMiddleware;
  let devMiddleware;

  //this should be called after the reporter is setup (so we don't miss reporting any events)
  // and after the vendor bundle is compiled (so we can refer to the vendor bundle)
  const useMiddleware = () => {
    if (bundlers.client) {

      //create the middlewares
      hotMiddleware = webpackHotMiddleware(bundlers.client.compiler, {
        log: false
      });
      devMiddleware = webpackDevMiddleware(bundlers.client.compiler, {
        noInfo: true,
        quiet: true
      });

      //apply the middlewares
      server
        .use(hotMiddleware)
        .use(devMiddleware)
      ;

    }
  };

  //create the server
  const server = new Server();

  //create the vendor bundler
  if (options.webpack.vendor) {
    bundlers.vendor = new Bundler(options.webpack.vendor);
  }

  //create the client bundler
  if (options.webpack.client) {

    //configure the middleware

    //create the compiler
    bundlers.client = new Bundler(options.webpack.client);

  }

  //create the build bundler
  if (options.webpack.build) {
    bundlers.build = new Bundler(options.webpack.build, {
      watch: true
    });
  }

  //create the server bundler
  if (options.webpack.server) {
    bundlers.server = new Bundler(options.webpack.server, {
      watch: true
    });
  }

  //create the reporter
  const reporter = new BuildReporter({
    debug: options.debug,
    server,
    bundlers: Object.values(bundlers)
  });

  //run the vendor bundler and then start the server
  if (bundlers.vendor) {
    bundlers.vendor
      .once('completed', () => {

        //if the user has CTL-C'd then don't bother starting the server
        if (exiting) return;

        //stop tracking the vendor bundler which has finished
        delete bundlers.vendor;

        //start the server
        server.start();
        useMiddleware();

      })
      .start()
    ;
  } else {

    //start the server
    server.start();
    useMiddleware();

  }

  //stop all the things when the user wants to exit
  process.on('SIGINT', () => {
    exiting = true;

    //stop the client bundler
    if (devMiddleware) {
      devMiddleware.close();
    }

    //stop the build and server bundlers
    if (bundlers.build) bundlers.build.stop();
    if (bundlers.server) bundlers.server.stop();

    //stop the server
    server.stop();

  });

};
