'use strict';
const webpack = require('webpack');

/**
 * Load the vendor manifest as the reference compiler is compiling (instead of when the reference compiler is instanciated)
 * and don't let webpack watch it (which results in re-builds because the timestamp is so new)
 */
class ReferenceDLLPlugin {

  constructor(options) {
    this.loaded = false;
    this.manifest = options.manifest;
  }

  apply(compiler) {
    compiler.plugin(['run', 'watch-run'], (compilerOrWatcher, callback) => {
      if (!this.loaded) {
        compiler.apply(new webpack.DllReferencePlugin({
          context: compiler.options.context,
          manifest: require(this.manifest)
        }));
      }
      this.loaded = true;
      callback();
    });
  }

}

module.exports = ReferenceDLLPlugin;
