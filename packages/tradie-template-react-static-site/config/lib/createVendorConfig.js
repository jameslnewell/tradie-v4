'use strict';
const createCommonConfig = require('./createCommonConfig');
const AssetsByChunkNameCachePlugin = require('./AssetsByChunkNameCachePlugin');

/**
 * @param   {object}          options
 * @param   {string}          options.root
 * @param   {Array.<string>}  options.scripts
 * @param   {object}          options.assetsByChunkNameCache
 * @returns {object}
 */
module.exports = options => {
  const metadata = options.metadata;

  //check there is at least one client-side script
  if (!metadata.layout.script && !metadata.pages.find(page => page.script)) {
    return;
  }

  const builder = createCommonConfig({
    styles: false,
    optimize: options.optimize
  });

  builder.configureVendorDLL();

  builder.merge({
    entry: {
      vendor: [
        'react', 'react-dom' //TODO: pull from site metadata
      ]
    },
    plugins: [
      new AssetsByChunkNameCachePlugin({cache: options.assetsByChunkNameCache})
    ]
  });

  return builder.toObject();
};
