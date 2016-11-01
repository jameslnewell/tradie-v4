/* @flow weak */
'use strict';
const webpack = require('webpack');
const createBundler = require('./util/createBundler');
const BuildReporter = require('./util/BuildReporter');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object} options
 * @param {boolean} [options.debug=false]
 * @param {boolean} [options.watch=false]
 * @param {object}  options.webpack
 * @param {object}  [options.webpack.vendor]
 * @param {object}  [options.webpack.client]
 * @param {object}  [options.webpack.server]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  let
    vendorBundler,
    clientBundler,
    buildBundler,
    serverBundler
  ;
  const reporter = new BuildReporter({debug: options.debug});

  const createVendorBundle = () => {
    if (options.webpack.vendor) {
      vendorBundler = createBundler(options.webpack.vendor, {reporter});
      return vendorBundler.run();
    } else {
      return Promise.resolve();
    }
  };

  const createClientAndBuildBundles = () => {

    //create the client bundler
    if (options.webpack.client) {
      clientBundler = createBundler(options.webpack.client, {
        reporter,
        watch: true
      });
    }

    //create the build bundler
    if (options.webpack.build) {
      buildBundler = createBundler(options.webpack.build, {
        reporter,
        watch: true
      });
    }

    if (clientBundler && buildBundler) {

      //start the build bundler after the client bundler has run for the first time,
      // and re-build the build bundler whenever the client bundler finishes
      return Promise.all([

        new Promise((resolve, reject) => {
          let started = false;

          clientBundler.plugin('done', () => {
            if (started) {
              buildBundler.invalidate()
            } else {
              started = true;
              buildBundler.run().then(resolve, reject);
            }
          });

        }),

        clientBundler.run()

      ]);

    } else if (clientBundler) {
      return clientBundler.run();
    } else if (buildBundler) {
      return buildBundler.run();
    }

  };

  const createServerBundle = () => {
    if (options.webpack.server) {
      serverBundler = createBundler(options.webpack.server, {
        reporter,
        watch: true
      });
      return serverBundler.run();
    } else {
      return Promise.resolve();
    }
  };

  const startServer = () => new Promise((resolve, reject) => {
    const chalk = require('chalk');
    const connect = require('connect');
    const detectPort = require('detect-port');
    const serveIndex = require('serve-index');
    const serveStatic = require('serve-static');

    let server;
    const app = connect();

    //setup the server
    app
      .use(serveStatic('./dist'))
      .use(serveIndex('./dist'))
    ;

    //start the server on a free port
    detectPort(3000)
      .then(port => {
        server = app.listen(port, (err) => {
          if (err) return reject(err);
          console.log(chalk.blue(`Server running at http://localhost:${port}`));
        });
      })
      .catch(reject)
    ;

    process.on('SIGINT', () => {
      if (server) {
        console.log('closing');
        server.close(error => {
          console.log('closed', error);
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
        console.log('closing started');
      }
    });

  });

  return Promise.all([

    createVendorBundle()
      .then(() => createClientAndBuildBundles()),

    createServerBundle(),

    startServer()

  ])

  //FIXME: hack to wait for BuildReporter to finish reporting
    .then(() => new Promise((resolve, reject) => setImmediate(() => {
      if (!options.watch && reporter.errors.length) {
        reject();
      } else {
        resolve();
      }
    })))

    ;

};
