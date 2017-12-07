import wfe from 'wait-for-event';
import objectValues from 'object.values';
import webpack from 'webpack';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackDevMiddleware from 'webpack-dev-middleware';
import Server from './utils/Server';
import Bundler from './utils/Bundler';
import BuildReporter from './utils/BuildReporter';

const noop = () => {
  /* do nothing*/
};

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
 * @param {string}    [options.onServerStart]
 * @param {string}    [options.onServerStop]
 * @returns {Promise.<null>}
 */
export default options => {
  const bundlers = {};
  let hotMiddleware = null;
  let devMiddleware = null;
  let exiting = false;
  let isServerStopped = Promise.resolve();

  const onServerStart = options.onServerStart || noop;
  const onServerStop = options.onServerStop || noop;

  //create the server
  const server = new Server();

  //create the vendor bundler
  if (options.webpack.vendor) {
    bundlers.vendor = new Bundler(options.webpack.vendor);
  }

  //create the client bundler
  if (options.webpack.client) {
    //configure HMR for the client bundle
    addEntry(
      options.webpack.client,
      `${require.resolve('webpack-hot-middleware/client')}?reload=true&overlay=true`
    );
    addPlugin(options.webpack.client, new webpack.HotModuleReplacementPlugin());

    //create the compiler
    bundlers.client = new Bundler(options.webpack.client);
  }

  //create the server bundler
  if (options.webpack.server) {
    //configure HMR for the server bundle
    //"webpack/hot/signal" - https://github.com/webpack/webpack/issues/3558
    addEntry(options.webpack.server, `${require.resolve('webpack/hot/poll')}?1000`);
    addPlugin(options.webpack.server, new webpack.NamedModulesPlugin());
    addPlugin(options.webpack.server, new webpack.HotModuleReplacementPlugin());

    //create the compiler
    bundlers.server = new Bundler(options.webpack.server, {
      watch: true
    });
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

  const startVendorCompiler = () =>
    new Promise((resolve, reject) => {
      if (!bundlers.vendor) {
        resolve();
        return;
      }

      bundlers.vendor
        .once('completed', () => {
          //stop tracking the vendor bundler which has finished compiling
          delete bundlers.vendor;

          resolve();
        })
        .once('error', reject)
        .start();
    });

  const startClientCompiler = () =>
    new Promise((resolve, reject) => {
      if (!bundlers.client) {
        resolve();
        return;
      }

      //create the middlewares (dev middleware starts watching)
      hotMiddleware = webpackHotMiddleware(bundlers.client.compiler, {
        log: false
      });
      devMiddleware = webpackDevMiddleware(bundlers.client.compiler, {
        noInfo: true,
        quiet: true,
        serverSideRender: false
      });

      //register HMR middlewares
      server.use(hotMiddleware).use(devMiddleware);

      bundlers.client.once('completed', resolve).once('error', reject);
    });

  const startServerCompiler = () =>
    new Promise((resolve, reject) => {
      if (!bundlers.server) {
        resolve();
        return;
      }

      bundlers.server
        .once('completed', resolve)
        .once('error', reject)
        .start();
    });

  const startBuildCompiler = () =>
    new Promise((resolve, reject) => {
      if (!bundlers.build) {
        resolve();
        return;
      }

      bundlers.build
        .once('completed', resolve)
        .once('error', reject)
        .start();
    });

  const startServer = () => {
    //if the user has CTL-C'd then don't bother starting the server
    if (exiting) return;

    //lets wait until the template has finished stopping stuff
    isServerStopped = new Promise((resolve, reject) => {
      server.on('stopped', () => {
        Promise.resolve(onServerStop(server)).then(resolve, reject);
      });
    });

    //start the server
    server.on('started', () => onServerStart(server)).start();
  };

  //stop all the things when the user wants to exit
  process.on('SIGINT', () => {
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
    .then(() => startVendorCompiler())
    .then(() => startClientCompiler())
    .then(() => Promise.all([startServerCompiler(), startBuildCompiler()]))
    .then(() => startServer())
    .then(
      () =>
        new Promise((resolve, reject) => {
          wfe.waitForAll('stopped', objectValues(bundlers), errors => {
            isServerStopped.then(
              () =>
                setImmediate(() => {
                  //HACK: wait for build-reporter
                  if (errors.length) {
                    reject(errors);
                  } else if (reporter.errors.length) {
                    reject();
                  } else {
                    resolve();
                  }
                }),
              reject
            );
          });
        })
    );
};
