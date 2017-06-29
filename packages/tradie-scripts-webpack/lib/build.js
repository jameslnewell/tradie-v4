'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = function(options) {
  var bundlers = [];
  var vendorBundler = null,
    clientBundler = null,
    buildBundler = null,
    serverBundler = null,
    exiting = false;

  //create the vendor bundler
  if (options.webpack.vendor) {
    vendorBundler = new _Bundler2.default(options.webpack.vendor, {
      name: 'vendor'
    });
    bundlers.push(vendorBundler);
  }

  //create the client bundler
  if (options.webpack.client) {
    clientBundler = new _Bundler2.default(options.webpack.client, {
      name: 'client',
      watch: options.watch
    });
    bundlers.push(clientBundler);
  }

  //create the build bundler
  if (options.webpack.build) {
    buildBundler = new _Bundler2.default(options.webpack.build, {
      name: 'build',
      watch: options.watch
    });
    bundlers.push(buildBundler);
  }

  //create the server bundler
  if (options.webpack.server) {
    serverBundler = new _Bundler2.default(options.webpack.server, {
      name: 'server',
      watch: options.watch
    });
    bundlers.push(serverBundler);
  }

  //create the reporter
  var reporter = new _BuildReporter2.default({
    debug: options.debug,
    bundlers
  });

  var runClientAndBuildBundles = function runClientAndBuildBundles() {
    if (clientBundler && buildBundler) {
      //start the build bundler after the client bundler has run for the first time,
      // and re-build the build bundler whenever the client bundler finishes
      clientBundler.once('completed', function() {
        if (exiting) return;

        //run the build bundler
        buildBundler.start();

        //re-run the build bundler
        clientBundler.on('completed', function() {
          return buildBundler.invalidate();
        });
      });

      //run the client bundler
      clientBundler.start();
    } else if (clientBundler) {
      //run the client bundler
      clientBundler.start();
    } else if (buildBundler) {
      //run the build bundler
      buildBundler.start();
    }
  };

  //run the vendor, client and build bundlers
  if (vendorBundler) {
    vendorBundler
      .once('completed', function() {
        if (exiting) return;

        //remove the completed bundler
        bundlers.splice(0, 1);

        //run the client and build bundlers
        runClientAndBuildBundles();
      })
      .start();
  } else {
    //run the client and build bundlers
    runClientAndBuildBundles();
  }

  //run the server bundler
  if (serverBundler) {
    serverBundler.start();
  }

  //stop all the things when the user wants to exit
  process.on('SIGINT', function() {
    exiting = true;
    bundlers.forEach(function(bundler) {
      return bundler.stop();
    });
  });

  //wait for all the bundlers to close before resolving or rejecting
  return new Promise(function(resolve, reject) {
    _waitForEvent2.default.waitForAll('stopped', bundlers, function(errors) {
      setImmediate(function() {
        //HACK: wait for build-reporter
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

var _waitForEvent = require('wait-for-event');

var _waitForEvent2 = _interopRequireDefault(_waitForEvent);

var _Bundler = require('./utils/Bundler');

var _Bundler2 = _interopRequireDefault(_Bundler);

var _BuildReporter = require('./utils/BuildReporter');

var _BuildReporter2 = _interopRequireDefault(_BuildReporter);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Run webpack on multiple bundles and display the results
 * @param {object} options
 * @param {boolean} [options.debug=false]
 * @param {boolean} [options.watch=false]
 * @param {object}  options.webpack
 * @param {object}  [options.webpack.vendor]
 * @param {object}  [options.webpack.client]
 * @param {object}  [options.webpack.build]
 * @param {object}  [options.webpack.server]
 * @returns {Promise.<null>}
 */
