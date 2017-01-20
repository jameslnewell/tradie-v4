/* @flow weak */
'use strict';
const tinylr = require('tiny-lr');
const getSiteMetadata = require('./lib/getSiteMetadata');
const createVendorConfig = require('./lib/createVendorConfig');
const createClientConfig = require('./lib/createClientConfig');
const createBuildConfig = require('./lib/createBuildConfig');
const LiveReloadWebpackPlugin = require('./lib/LiveReloadWebpackPlugin');

module.exports = cliOptions => {
  const assetsByChunkNameCache = {};
  let liveReloadServer;

  const onServerStart = () => {
    return new Promise((resolve, reject) => {

      liveReloadServer = tinylr({
        errorListener: err => {
          if (err.code === 'EADDRINUSE') {
            console.warn(chalk.yellow(
              'WARN: A LiveReload server is already running.\n' +
              'If the already running LiveReload server is shut down while this instance of tradie is running,' +
              ' LiveReload will cease to work.'
            ));
            resolve(); //use the already running server
          } else {
            reject(err);
          }
        }
      });

      liveReloadServer.listen(35729, resolve);

    });
  };

  const onServerStop = () => {
    return new Promise((resolve) => {
      liveReloadServer.once('close', () => resolve);
      liveReloadServer.close();
    });
  };

  return getSiteMetadata(cliOptions.root)
    .then(metadata => {

      return Promise.all([

        createVendorConfig({
          root: cliOptions.root,
          optimize: cliOptions.optimize,
          metadata,
          assetsByChunkNameCache
        }),

        createClientConfig({
          root: cliOptions.root,
          optimize: cliOptions.optimize,
          metadata,
          assetsByChunkNameCache
        }),

        createBuildConfig({
          root: cliOptions.root,
          optimize: cliOptions.optimize,
          metadata,
          assetsByChunkNameCache
        })

      ])
        .then(webpackConfigs => {

          const vendorWebpackConfig = webpackConfigs[0];
          const clientWebpackConfig = webpackConfigs[1];
          const buildWebpackConfig = webpackConfigs[2];

          //live-reload the things
          if (clientWebpackConfig) {
            clientWebpackConfig.plugins.push(new LiveReloadWebpackPlugin());
          }
          if (buildWebpackConfig) {
            buildWebpackConfig.plugins.push(new LiveReloadWebpackPlugin());
          }

          return ({

            debug: cliOptions.debug,
            webpack: {
              vendor: vendorWebpackConfig,
              client: clientWebpackConfig,
              build: buildWebpackConfig
            },

            onServerStart,
            onServerStop

          });

        })
      ;

    })
    ;

};
