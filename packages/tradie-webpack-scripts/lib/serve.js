/* @flow weak */
'use strict';
const wfe = require('wait-for-event');
const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const Server = require('./util/Server');
const Bundler = require('./util/Bundler');
const BuildReporter = require('./util/BuildReporter');

/**
 * Add a new entry to the Webpack config
 * @param {object} webpackConfig
 * @param {object} newEntry
 */
const addEntry = (webpackConfig, newEntry) => {
  if (Array.isArray(webpackConfig.entry)) {
    webpackConfig.entry.push(newEntry);
  } else if (typeof webpackConfig.entry === 'object') {
    Object.keys(webpackConfig.entry).forEach(entry => {
      webpackConfig.entry[entry] = [].concat(webpackConfig.entry[entry], newEntry);
    });
  } else {
    webpackConfig.entry = [webpackConfig.entry, newEntry];
  }
};

/**
 * Add a new plugin to the Webpack config
 * @param {object} webpackConfig
 * @param {object} newPlugin
 */
const addPlugin = (webpackConfig, newPlugin) => {
  webpackConfig.plugins = webpackConfig.plugins || [];
  webpackConfig.plugins.push(newPlugin);
};

/**
 * Run Webpack on multiple bundles and display the results
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
        // noInfo: true,
        // quiet: true,
        serverSideRender: false
      });

      //apply the middlewares
      console.log('setup dev middleware')
      server
        .use(hotMiddleware)
        .use(devMiddleware)
      ;

    }

    if (bundlers.server) {

      //start compiling the server
      //TODO: wait till client is finished so we have access to asset manifest?
      bundlers.server.start();

      // proxy requests to the server
      console.log('setup proxy')
      server.use(proxyMiddleware({
        target: 'http://localhost:4000', //TODO: make configurable
        logLevel: 'warn'
      }));

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

    //configure HMR
    addEntry(options.webpack.client, `${require.resolve('webpack-hot-middleware/client')}?reload=true&overlay=true`);
    addPlugin(options.webpack.client, new webpack.HotModuleReplacementPlugin());

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

    //configure HMR
    //"webpack/hot/signal" - https://github.com/webpack/webpack/issues/3558
    addEntry(options.webpack.server, `${require.resolve('webpack/hot/poll')}?1000`);
    addPlugin(options.webpack.server, new webpack.NamedModulesPlugin());
    addPlugin(options.webpack.server, new webpack.HotModuleReplacementPlugin());

    bundlers.server = new Bundler(options.webpack.server, {
      watch: true
    });

    //TODO: start node process if it isn't already running

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
