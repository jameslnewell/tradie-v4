'use strict';
const chalk = require('chalk');
const connect = require('connect');
const detectPort = require('detect-port');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const createWebpackDevMiddleware = require('webpack-dev-middleware');
const createWebpackHotMiddleware = require('webpack-hot-middleware');

const webpack = require('webpack');
const BuildReporter = require('./util/BuildReporter');
const configureClientHMR = require('./util/configureClientHMR');
const configureServerHMR = require('./util/configureServerHMR');
const runWebpack = require('./util/runWebpack');
const runWebpackServer = require('./util/runWebpackServer');

/**
 * Run webpack dev-server on multiple bundles and display the results
 * @param {object} options
 * @param {boolean} [options.debug=false]
 * @param {object}  options.webpack
 * @param {object}  [options.webpack.vendor]
 * @param {object}  [options.webpack.client]
 * @param {object}  [options.webpack.server]
 * @returns {Promise.<null>}
 */
module.exports = options => {
  const reporter = new BuildReporter({debug: options.debug});

  const createVendorBundle = () => {
    if (options.webpack.vendor) {
      const compiler = webpack(options.webpack.vendor);
      reporter.observe(compiler);
      return runWebpack(false, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const startClientBundle = () => {
    const config = options.webpack.client;
    console.log('starting client');
    if (config) {
      configureClientHMR(config);
      const compiler = webpack(config);
      reporter.observe(compiler);
      return runWebpackServer({
        publicDir: config.output.path,
        publicUrl: config.output.publicPath
      }, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const startServerBundle = () => {
    return Promise.resolve();
    const config = options.webpack.server;
    if (config) {
      configureServerHMR(config);
      const compiler = webpack(config);
      reporter.observe(compiler);
      return runWebpack(true, compiler);
    } else {
      return Promise.resolve();
    }
  };

  const startServer = () => new Promise((resolve, reject) => {
    let server;
    const app = connect();

    //setup the server
    app
      .use(serveStatic('./dist'))
      .use(serveIndex('./dist'))
    ;

    //if there is a client bundle
    let webpackDevMiddleware;
    let webpackHotMiddleware;
    const clientConfig = options.webpack.client;
    // if (clientConfig) {
    //   console.log('configuring the client');
    //   configureClientHMR(clientConfig);
    //   const compiler = webpack(clientConfig);
    //
    //   reporter.observe(compiler);
    //
    //   webpackDevMiddleware = createWebpackDevMiddleware(compiler, {
    //
    //   });
    //
    //   webpackHotMiddleware = createWebpackHotMiddleware(compiler, {
    //     // log: console.log
    //   });
    //
    //   app
    //     .use(webpackDevMiddleware)
    //     .use(webpackHotMiddleware)
    //   ;
    //
    // }

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

    //stop serving and exit when the user presses CTL-C
    process.on('SIGINT', () => {
      console.log('CTL-C');
      Promise.all([

        //stop the webpack-dev-middleware
        () => new Promise((resolve, reject) => {
          console.log('has middleware?');
          if (webpackDevMiddleware) {
            console.log('closing middleware');
            webpackDevMiddleware.close(error => {
              console.log('closed middleware', error);
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          }
        }),

        //stop the server
        () => new Promise((resolve, reject) => {
          console.log('has server?');
          if (server) {
            console.log('closing server');
            server.close(error => {
              console.log('closed server', error);
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          }
        })

      ])
        .then(resolve, reject)
      ;
    });

  });

  return Promise.all([
    startServerBundle(),
    createVendorBundle()
      .then(() => startServer())
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
