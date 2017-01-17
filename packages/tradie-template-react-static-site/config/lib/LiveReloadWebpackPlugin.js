'use strict';
const debug = require('debug')('live-reload-webpack-plugin');
const axios = require('axios');

class LiveReloadWebpackPlugin {

  constructor(options) {
    this.host = options && options.host || 'localhost';
    this.port = options && options.port || 35729;
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      const json = stats.toJson();

      //FIXME: currently all assets are reloaded... we only want to reload changed assets?!
      const files = json.assets.map(asset => asset.name);
      debug(`Reloading assets:\n    ${files.join('\n    ')}\n`);
      axios.post(`http://${this.host}:${this.port}/changed`, {files})
        .catch(error => debug('Error reloading assets: %s', error))
      ;

    });
  }

}

module.exports = LiveReloadWebpackPlugin;
