'use strict';
const wfe = require('wait-for-event');
const objectValues = require('object.values');
const webpack = require('webpack');
const serveStatic = require('serve-static');
const proxyMiddleware = require('http-proxy-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const Server = require('./util/Server');
const Process = require('./util/Process');
const Bundler = require('./util/Bundler');
const BuildReporter = require('./util/BuildReporter');

const APP_PORT = 4000;

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
 * @param {string}    [options.serverPath]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  const bundlers = {};
  let app;
  let hotMiddleware;
  let devMiddleware;
  let exiting = false;

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

  //create the server bundler
  if (options.webpack.server) {

    //configure HMR
    //"webpack/hot/signal" - https://github.com/webpack/webpack/issues/3558
    addEntry(options.webpack.server, `${require.resolve('webpack/hot/poll')}?1000`);
    addPlugin(options.webpack.server, new webpack.NamedModulesPlugin());
    addPlugin(options.webpack.server, new webpack.HotModuleReplacementPlugin());

    //create the compiler
    bundlers.server = new Bundler(options.webpack.server, {
      watch: true
    });

    //create the app
    if (options.serverPath) {
      app = new Process(options.serverPath, {
        env: {PORT: APP_PORT}
      });
    }

  }

  //create the build bundler
  if (options.webpack.build) {
    bundlers.build = new Bundler(options.webpack.build, {
      watch: true
    });
  }

  //create the reporter
  const reporter = new BuildReporter({
    debug: options.debug,
    server,
    bundlers: objectValues(bundlers)
  });

  const startVendorCompiler = () => new Promise((resolve, reject) => {
    if (bundlers.vendor) {
      bundlers.vendor
        .once('completed', () => {

          //stop tracking the vendor bundler which has finished
          delete bundlers.vendor;

          resolve();

        })
        .once('error', reject)
        .start()
      ;
    } else {
      resolve();
    }
  });

  const startClientCompiler = () => new Promise((resolve, reject) => {
    if (bundlers.client) {

      //create the middlewares (dev middleware starts watching)
      hotMiddleware = webpackHotMiddleware(bundlers.client.compiler, {
        log: false
      });
      devMiddleware = webpackDevMiddleware(bundlers.client.compiler, {
        noInfo: true,
        quiet: true,
        serverSideRender: false
      });

      bundlers.client
        .once('completed', resolve)
        .once('error', reject)
      ;

    } else {
      resolve();
    }
  });

  const startServerCompiler = () => new Promise((resolve, reject) => {
    if (bundlers.server) {
      bundlers.server
        .once('completed', resolve)
        .once('error', reject)
        .start()
      ;
    } else {
      resolve();
    }
  });

  const startBuildCompiler = () => new Promise((resolve, reject) => {
    if (bundlers.build) {
      bundlers.build
        .once('completed', resolve)
        .once('error', reject)
        .start()
      ;
    } else {
      resolve();
    }
  });

  const startServer = () => {

    //if the user has CTL-C'd then don't bother starting the server
    if (exiting) return;

    //serve client files
    if (bundlers.client) {
      server
        .use(hotMiddleware)
        .use(devMiddleware)
      ;
    }

    //proxy server TODO: move to the app template?
    if (bundlers.server) {
      server.use(proxyMiddleware({
        target: `http://localhost:${APP_PORT}`, //TODO: make configurable
        logLevel: 'warn'
      }));
    }

    //serve files assuming S3 TODO: move to static-site template?
    if (bundlers.build) {
      server.use(serveStatic('./dist')) //FIXME: configure directory
    }

    //start the server
    server.start();

    //start the app
    if (app) app.start();

  };

  //stop all the things when the user wants to exit
  process.on('SIGINT', () => {
    exiting = true;

    //stop the client from compiling
    if (devMiddleware) {
      devMiddleware.close();
    }

    //stop the build and server from compiling
    if (bundlers.build) bundlers.build.stop();
    if (bundlers.server) bundlers.server.stop();
    if (app) app.stop();

    //stop the server
    server.stop();

  });

  return Promise.resolve()
    .then(() => startVendorCompiler())
    .then(() => startClientCompiler())
    .then(() => Promise.all([
      startServerCompiler(),
      startBuildCompiler()
    ]))
    .then(() => startServer())
    .then(() => {

      //wait for all the compilers and server to close before resolving or rejecting
      return new Promise((resolve, reject) => {
        const stoppable = [].concat(objectValues(bundlers), server, app).filter(s => Boolean(s));
        wfe.waitForAll('stopped', stoppable, errors => {
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

    })
  ;

};
