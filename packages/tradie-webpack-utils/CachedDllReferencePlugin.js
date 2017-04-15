'use strict';
const webpack = require('webpack');

/**
 * Load the vendor manifest as the reference compiler is compiling (instead of when the reference plugin is instanciated and the file may not exist)
 * and don't let webpack watch the file (because this results in many re-builds because the timestamp is so new)
 * NOTE: using this plugin means the consuming bundle will never update if the vendor bundle/manifest is rebuilt
 * TODO: use ApplyPluginOnRunPlugin
 */
class CachedDllReferencePlugin {
  constructor(options) {
    this.loaded = false;
    this.manifest = options.manifest;
  }

  apply(compiler) {
    compiler.plugin(['run', 'watch-run'], (compilerOrWatcher, callback) => {
      if (!this.loaded) {
        compiler.apply(
          new webpack.DllReferencePlugin({
            context: compiler.options.context,
            manifest: require(this.manifest) //eslint-disable-line global-require
          })
        );
      }
      this.loaded = true;
      callback();
    });
  }
}

module.exports = CachedDllReferencePlugin;
