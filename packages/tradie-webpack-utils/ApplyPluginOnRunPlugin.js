'use strict';
const webpack = require('webpack');

/**
 */
class ApplyPluginOnRunPlugin {

  constructor(options) {
    this.loaded = false;
    this.plugin = options.plugin;
  }

  apply(compiler) {
    compiler.plugin(['run', 'watch-run'], (compilerOrWatcher, callback) => {
      if (!this.loaded) {
        this.loaded = true;
        compiler.apply(this.plugin);
      }
      callback();
    });
  }

}

module.exports = ApplyPluginOnRunPlugin;
