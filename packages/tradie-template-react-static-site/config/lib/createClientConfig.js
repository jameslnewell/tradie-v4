'use strict';
const path = require('path');
const createCommonConfig = require('./createCommonConfig');
const AssetsByChunkNameCachePlugin = require('./AssetsByChunkNameCachePlugin');

/**
 * @param   {object}  options
 * @param   {string}  options.root
 * @param   {object}  options.metadata
 * @param   {object}  options.assetsByChunkNameCache
 * @returns {object}
 */
module.exports = options => {
  const metadata = options.metadata;

  //create a list of entries
  const entries = {};
  if (metadata.layout.script) {
    entries[metadata.layout.chunkName] = metadata.layout.script;
  }
  metadata.pages.forEach(page => {
    if (page.component && page.script) {
      entries[page.chunkName] = page.script;
    }
  });

  //check there is at least one client-side script
  if (Object.keys(entries).length === 0) {
    return;
  }

  const builder = createCommonConfig({
    styles: 'external',
    optimize: options.optimize
  });

  builder.referenceVendorDLL();

  builder.merge({

    entry: entries,

    plugins: [
      new AssetsByChunkNameCachePlugin({cache: options.assetsByChunkNameCache})
    ]

  });

  return builder.toObject();
};
