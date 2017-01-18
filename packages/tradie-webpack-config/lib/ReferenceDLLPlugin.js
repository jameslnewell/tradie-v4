'use strict';
const webpack = require('webpack');

/**
 * Load the vendor manifest on demand without watching it (which results in re-builds because the timestamp is so recent)
 */
class ReferenceDLLPlugin {

  constructor(options) {
    this.manifest = options.manifest;
  }

  apply(compiler) {
    compiler.apply(new webpack.DllReferencePlugin({
      context: compiler.options.context,
      manifest: require(this.manifest)
    }));
  }

}

module.exports = ReferenceDLLPlugin;
