/* @flow weak */
'use strict';
const wfe = require('wait-for-event');
const Server = require('./util/Server');
const Bundler = require('./util/Bundler');
const BuildReporter = require('./util/BuildReporter');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object} options
 * @param {boolean} [options.debug=false]
 * @param {object}  options.webpack
 * @param {object}  [options.webpack.vendor]
 * @param {object}  [options.webpack.client]
 * @param {object}  [options.webpack.build]
 * @param {object}  [options.webpack.server]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  let
    activeBundlers = [],
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
    activeBundlers.push(vendorBundler);
  }

  //create the client bundler
  if (options.webpack.client) {
    clientBundler = new Bundler(options.webpack.client, {
      name: 'client',
      watch: true
    });
    activeBundlers.push(clientBundler);
  }

  //create the build bundler
  if (options.webpack.build) {
    buildBundler = new Bundler(options.webpack.build, {
      name: 'build',
      watch: true
    });
    activeBundlers.push(buildBundler);
  }

  //create the server bundler
  if (options.webpack.server) {
    serverBundler = new Bundler(options.webpack.server, {
      name: 'server',
      watch: true
    });
    activeBundlers.push(serverBundler);
  }

  //create the server
  server = new Server();

  //create the reporter
  const reporter = new BuildReporter({
    debug: options.debug,
    server,
    bundlers: activeBundlers
  });

  const runClientAndBuildBundles = () => {

    if (clientBundler && buildBundler) {

      //start the build bundler after the client bundler has run for the first time,
      // and re-build the build bundler whenever the client bundler finishes
      clientBundler.once('completed', () => {

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
        activeBundlers.splice(0, 1);

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
    console.log('stopping all the things');
    server.stop();
    activeBundlers.forEach(bundler => bundler.stop());
  });

  //start the server after the other bundlers finish if the user doesn't want to ext
  wfe.waitForAll('completed', activeBundlers, () => {
    if (!exiting) {
      server.start();
    }
  });

  //wait for all the bundlers and server to close before resolving or rejecting
  return new Promise((resolve, reject) => {
    wfe.waitForAll('stopped', activeBundlers.concat(server), errors => {
      console.log('stopped all the things');
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
