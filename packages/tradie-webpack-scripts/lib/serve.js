'use strict';
const wfe = require('wait-for-event');
const webpack = require('webpack');
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
  const applyHMRMiddleware = () => {
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

    //configure the HMR client
    const hmrEntry = 'webpack-hot-middleware/client?reload=true&overlay=true';
    if (Array.isArray(options.webpack.client.entry)) {
      options.webpack.client.entry.push(hmrEntry);
    } else if (typeof options.webpack.client.entry === 'object') {
      Object.keys(options.webpack.client.entry).forEach(entry => {
        if (Array.isArray(options.webpack.client.entry[entry])) {
          options.webpack.client.entry[entry].push(hmrEntry);
        } else {
          options.webpack.client.entry[entry] = [options.webpack.client.entry[entry], hmrEntry];
        }
      });
      options.webpack.client.entry = [options.webpack.client.entry, hmrEntry];
    } else {
      options.webpack.client.entry = [options.webpack.client.entry, hmrEntry];
    }

    //configure the HMR plugin
    options.webpack.client.plugins = options.webpack.client.plugins || [];
    options.webpack.client.plugins.push(new webpack.HotModuleReplacementPlugin());

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
        applyHMRMiddleware();
        server.start();

      })
      .start()
    ;
  } else {

    //start the server
    applyHMRMiddleware();
    server.start();

  }

  //stop all the things when the user wants to exit
  process.on('SIGINT', () => {
    exiting = true;

    //stop the client from compiling
    if (devMiddleware) {
      devMiddleware.close(); //TODO: wait for client close before resolving
    }

    //stop the build and server from compiling
    if (bundlers.build) bundlers.build.stop();
    if (bundlers.server) bundlers.server.stop();

    //stop the server
    server.stop();

  });

  //wait for all the compilers and server to close before resolving or rejecting
  return new Promise((resolve, reject) => {
    const arr = [server];
    if (bundlers.build) arr.push(bundlers.build);
    if (bundlers.server) arr.push(bundlers.server);
    wfe.waitForAll('stopped', arr, errors => { //TODO: wait for the client compiler too
      setImmediate(() => { //HACK: wait for build-reporter
        if (errors.length) {
          reject(errors);
        } else if (reporter.errors.length) {
          reject();
        } else {
          resolve();
        }
      });

    });
  });

};
