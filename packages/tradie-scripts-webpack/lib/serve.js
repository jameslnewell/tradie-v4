'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _waitForEvent = require('wait-for-event');

var _waitForEvent2 = _interopRequireDefault(_waitForEvent);

var _object = require('object.values');

var _object2 = _interopRequireDefault(_object);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _Server = require('./utils/Server');

var _Server2 = _interopRequireDefault(_Server);

var _Bundler = require('./utils/Bundler');

var _Bundler2 = _interopRequireDefault(_Bundler);

var _BuildReporter = require('./utils/BuildReporter');

var _BuildReporter2 = _interopRequireDefault(_BuildReporter);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

var noop = function noop() {
  /* do nothing*/
};

/**
 * Add a new entry to the Webpack config
 * @param {object} webpackConfig
 * @param {object} newEntry
 */
var addEntry = function addEntry(webpackConfig, newEntry) {
  if (Array.isArray(webpackConfig.entry)) {
    webpackConfig.entry.push(newEntry);
  } else if (typeof webpackConfig.entry === 'object') {
    Object.keys(webpackConfig.entry).forEach(function(entry) {
      webpackConfig.entry[entry] = [].concat(
        webpackConfig.entry[entry],
        newEntry
      );
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
var addPlugin = function addPlugin(webpackConfig, newPlugin) {
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
 * @param {string}    [options.onServerStart]
 * @param {string}    [options.onServerStop]
 * @returns {Promise.<null>}
 */

exports.default = function(options) {
  var bundlers = {};
  var hotMiddleware = null;
  var devMiddleware = null;
  var exiting = false;
  var isServerStopped = Promise.resolve();

  var onServerStart = options.onServerStart || noop;
  var onServerStop = options.onServerStop || noop;

  //create the server
  var server = new _Server2.default();

  //create the vendor bundler
  if (options.webpack.vendor) {
    bundlers.vendor = new _Bundler2.default(options.webpack.vendor);
  }

  //create the client bundler
  if (options.webpack.client) {
    //configure HMR for the client bundle
    addEntry(
      options.webpack.client,
      `${require.resolve(
        'webpack-hot-middleware/client'
      )}?reload=true&overlay=true`
    );
    addPlugin(
      options.webpack.client,
      new _webpack2.default.HotModuleReplacementPlugin()
    );

    //create the compiler
    bundlers.client = new _Bundler2.default(options.webpack.client);
  }

  //create the server bundler
  if (options.webpack.server) {
    //configure HMR for the server bundle
    //"webpack/hot/signal" - https://github.com/webpack/webpack/issues/3558
    addEntry(
      options.webpack.server,
      `${require.resolve('webpack/hot/poll')}?1000`
    );
    addPlugin(
      options.webpack.server,
      new _webpack2.default.NamedModulesPlugin()
    );
    addPlugin(
      options.webpack.server,
      new _webpack2.default.HotModuleReplacementPlugin()
    );

    //create the compiler
    bundlers.server = new _Bundler2.default(options.webpack.server, {
      watch: true
    });
  }

  //create the build bundler
  if (options.webpack.build) {
    bundlers.build = new _Bundler2.default(options.webpack.build, {
      watch: true
    });
  }

  //create the reporter
  var reporter = new _BuildReporter2.default({
    debug: options.debug,
    server,
    bundlers: (0, _object2.default)(bundlers)
  });

  var startVendorCompiler = function startVendorCompiler() {
    return new Promise(function(resolve, reject) {
      if (!bundlers.vendor) {
        resolve();
        return;
      }

      bundlers.vendor
        .once('completed', function() {
          //stop tracking the vendor bundler which has finished compiling
          delete bundlers.vendor;

          resolve();
        })
        .once('error', reject)
        .start();
    });
  };

  var startClientCompiler = function startClientCompiler() {
    return new Promise(function(resolve, reject) {
      if (!bundlers.client) {
        resolve();
        return;
      }

      //create the middlewares (dev middleware starts watching)
      hotMiddleware = (0, _webpackHotMiddleware2.default)(
        bundlers.client.compiler,
        {
          log: false
        }
      );
      devMiddleware = (0, _webpackDevMiddleware2.default)(
        bundlers.client.compiler,
        {
          noInfo: true,
          quiet: true,
          serverSideRender: false
        }
      );

      //register HMR middlewares
      server.use(hotMiddleware).use(devMiddleware);

      bundlers.client.once('completed', resolve).once('error', reject);
    });
  };

  var startServerCompiler = function startServerCompiler() {
    return new Promise(function(resolve, reject) {
      if (!bundlers.server) {
        resolve();
        return;
      }

      bundlers.server.once('completed', resolve).once('error', reject).start();
    });
  };

  var startBuildCompiler = function startBuildCompiler() {
    return new Promise(function(resolve, reject) {
      if (!bundlers.build) {
        resolve();
        return;
      }

      bundlers.build.once('completed', resolve).once('error', reject).start();
    });
  };

  var startServer = function startServer() {
    //if the user has CTL-C'd then don't bother starting the server
    if (exiting) return;

    //lets wait until the template has finished stopping stuff
    isServerStopped = new Promise(function(resolve, reject) {
      server.on('stopped', function() {
        Promise.resolve(onServerStop(server)).then(resolve, reject);
      });
    });

    //start the server
    server
      .on('started', function() {
        return onServerStart(server);
      })
      .start();
  };

  //stop all the things when the user wants to exit
  process.on('SIGINT', function() {
    exiting = true;

    //stop the client bundle from compiling
    if (devMiddleware) devMiddleware.close();

    //stop the build and server bundles from compiling
    if (bundlers.build) bundlers.build.stop();
    if (bundlers.server) bundlers.server.stop();

    //stop the server from running
    server.stop();
  });

  //wait for all the compilers and server to stop before resolving or rejecting the command
  return Promise.resolve()
    .then(function() {
      return startVendorCompiler();
    })
    .then(function() {
      return startClientCompiler();
    })
    .then(function() {
      return Promise.all([startServerCompiler(), startBuildCompiler()]);
    })
    .then(function() {
      return startServer();
    })
    .then(function() {
      return new Promise(function(resolve, reject) {
        _waitForEvent2.default.waitForAll(
          'stopped',
          (0, _object2.default)(bundlers),
          function(errors) {
            isServerStopped.then(function() {
              return setImmediate(function() {
                //HACK: wait for build-reporter
                if (errors.length) {
                  reject(errors);
                } else if (reporter.errors.length) {
                  reject();
                } else {
                  resolve();
                }
              });
            }, reject);
          }
        );
      });
    });
};
