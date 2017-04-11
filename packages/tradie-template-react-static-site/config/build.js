'use strict';
const getSiteMetadata = require('./lib/getSiteMetadata');
const getWebpackVendorConfig = require('./lib/getWebpackVendorConfig');
const getWebpackClientConfig = require('./lib/getWebpackClientConfig');
const getWebpackBuildConfig = require('./lib/getWebpackBuildConfig');

module.exports = options => {
  const root = options.root;
  const debug = options.debug;
  const optimize = options.optimize;
  const watch = options.watch;
  const manifest = [];

  return getSiteMetadata(root)
    .then(metadata => {

      return {
        debug,
        watch,
        webpack: {
          vendor: getWebpackVendorConfig({root, optimize, manifest}),
          client: getWebpackClientConfig({root, optimize, metadata, manifest}),
          build: getWebpackBuildConfig({root, optimize, metadata, manifest})
        }
      };

    })
  ;

};
