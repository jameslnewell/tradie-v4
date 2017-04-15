'use strict';

/**
 * TODO: finish and use for applying DLL plugin with manifest required on first run
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
