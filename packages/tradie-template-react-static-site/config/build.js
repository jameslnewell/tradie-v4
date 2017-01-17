/* @flow weak */
'use strict';
const getSiteMetadata = require('./lib/getSiteMetadata');
const createVendorConfig = require('./lib/createVendorConfig');
const createClientConfig = require('./lib/createClientConfig');
const createBuildConfig = require('./lib/createBuildConfig');

module.exports = cliOptions => {
  const assetsByChunkNameCache = {};

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
        .then(webpackConfigs => ({
          debug: cliOptions.debug,
          watch: cliOptions.watch,
          webpack: {
            vendor: webpackConfigs[0],
            client: webpackConfigs[1],
            build: webpackConfigs[2]
          }
        }))
      ;

    })
  ;

};
