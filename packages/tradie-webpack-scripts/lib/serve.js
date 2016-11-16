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
    bundlers = [],
    vendorBundler,
    clientBundler,
    buildBundler,
    serverBundler,
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
    bundlers
  });

  const runClientAndBuildBundles = () => {

    if (clientBundler && buildBundler) {

      //start the build bundler after the client bundler has run for the first time,
      // and re-build the build bundler whenever the client bundler finishes
      clientBundler.once('finish', () => {

        //run the build bundler
        buildBundler.run();

        //re-run the build bundler
        clientBundler.on('finish', () => buildBundler.invalidate());

      });

      //run the client bundler
      clientBundler.run();

    } else if (clientBundler) {

      //run the client bundler
      clientBundler.run();

    } else if (buildBundler) {

      //run the build bundler
      buildBundler.run();

    }

  };

  //run the vendor, client and build bundlers
  if (vendorBundler) {
    vendorBundler
      .once('finish', () => {

        //remove the finished bundle
        bundlers.splice(0, 1);

        //run the client and build bundlers
        runClientAndBuildBundles();

      })
      .run()
    ;
  } else {

    //run the client and build bundlers
    runClientAndBuildBundles();

  }

  //run the server bundler
  if (serverBundler) {
    serverBundler.run();
  }

  //run the server after the other bundlers finish
  wfe.waitForAll('finish', bundlers, () => {
    //TODO: handle CTL-C logic in serve.js/build.js so we know whether we're exiting already and can skip running the server
    server.run()
  });

  //wait for all the bundlers and server to close before resolving or rejecting
  return new Promise((resolve, reject) => {
    wfe.waitForAll('close', bundlers.concat(server), errors => { //FIXME: if CTL-C before server is started then don't wait for the server
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
