/* @flow weak */
'use strict';
const wfe = require('wait-for-event');
const Server = require('./util/Server');
const Bundler = require('./util/Bundler');
const BuildReporter = require('./util/BuildReporter');

const noop = () => {/* do nothing */};

/**
 * Run webpack on multiple bundles and display the results
 * @param {object} options
 * @param {boolean}   [options.debug=false]
 * @param {object}    options.webpack
 * @param {object}    [options.webpack.vendor]
 * @param {object}    [options.webpack.client]
 * @param {object}    [options.webpack.build]
 * @param {object}    [options.webpack.server]
 * @param {function}  [options.onServerStart]
 * @param {function}  [options.onServerStop]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  const onServerStart = options.onServerStart || noop;
  const onServerStop = options.onServerStop || noop;
  let
    bundlers = [],
    vendorBundler,
    clientBundler,
    buildBundler,
    serverBundler,
    exiting,
    server
    ;

  //create the vendor bundler
  if (options.webpack.vendor) {
    vendorBundler = new Bundler(options.webpack.vendor, {
      name: 'vendor'
    });
    bundlers.push(vendorBundler);
  }

  //create the client bundler
  if (options.webpack.client) {
    clientBundler = new Bundler(options.webpack.client, {
      name: 'client',
      watch: true
    });
    bundlers.push(clientBundler);
  }

  //create the build bundler
  if (options.webpack.build) {
    buildBundler = new Bundler(options.webpack.build, {
      name: 'build',
      watch: true
    });
    bundlers.push(buildBundler);
  }

  //create the server bundler
  if (options.webpack.server) {
    serverBundler = new Bundler(options.webpack.server, {
      name: 'server',
      watch: true
    });
    bundlers.push(serverBundler);
  }

  //create the server
  server = new Server();

  //create the reporter
  const reporter = new BuildReporter({
    debug: options.debug,
    server,
    bundlers
  });

  const runClientAndBuildBundles = () => {

    if (clientBundler && buildBundler) {

      //start the build bundler after the client bundler has run for the first time,
      // and re-build the build bundler whenever the client bundler finishes
      clientBundler.once('completed', () => {
        if (exiting) return;

        //run the build bundler
        buildBundler.start();

        //re-run the build bundler
        clientBundler.on('completed', () => buildBundler.invalidate());

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
      .once('completed', () => {
        if (exiting) return;

        //remove the finished bundler
        bundlers.splice(0, 1);

        //run the client and build bundlers
        runClientAndBuildBundles();

      })
      .start()
    ;
  } else {

    //run the client and build bundlers
    runClientAndBuildBundles();

  }

  //run the server bundler
  if (serverBundler) {
    serverBundler.start();
  }

  //stop all the things when the user wants to exit
  process.on('SIGINT', () => {
    exiting = true;
    server.stop();
    bundlers.forEach(bundler => bundler.stop());
  });

  //start the server after the other bundlers finish if the user doesn't want to ext
  wfe.waitForAll('completed', bundlers, () => {
    if (!exiting) {
      setImmediate(() => { //HACK: wait for build-reporter
        server.start();
        onServerStart();
      });
    }
  });

  //wait for all the bundlers and server to close before resolving or rejecting
  return new Promise((resolve, reject) => {
    wfe.waitForAll('stopped', bundlers, errors => {
      server.stop()
        .then(() => onServerStop())
        .then(() => setImmediate(() => { //HACK: wait for build-reporter
          if (errors.length) {
            reject(errors);
          } else if (reporter.errors.length) {
            reject();
          } else {
            resolve();
          }
        }))
      ;

    });
  });

};
