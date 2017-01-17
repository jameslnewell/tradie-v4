/* @flow weak */
'use strict';

class AssetsByChunkNameCachePlugin {

  /**
   * @param {object} options
   * @param {object} options.cache
   */
  constructor(options) {
    this.cache = options.cache;
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      const json = stats.toJson();
      this.cache = Object.assign(this.cache, json.assetsByChunkName);
    });
  }

}

module.exports = AssetsByChunkNameCachePlugin;
