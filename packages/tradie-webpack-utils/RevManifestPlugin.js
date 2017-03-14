'use strict';
const fs = require('fs');
const path = require('path');

class RevManifestPlugin {

  constructor(options) {
    this.manifestFilename = options && options.filename || 'rev-manifest.json';
    this.manifest = options && options.cache || {};
  }

  apply(compiler) {

    compiler.plugin('emit', (compilation, callback) => {

      //get the manifest assets
      compilation.chunks.forEach(chunk => {
        if (chunk.isInitial()) {
          chunk.files.forEach(filename => {

            //exclude `*.map` files
            if (filename.endsWith('.map')) {
              return;
            }

            //remove the hash from the filename to get the build filename
            const originalFilename = filename.replace(/\.[a-zA-Z0-9]+\./, '.');
            this.manifest[originalFilename] = filename;

          });
        }

      });

      //write the manifest to file (using webpack)
      const manifestJSON = JSON.stringify(this.manifest, null, 2);
      compilation.assets[this.manifestFilename] = {
        source: () => manifestJSON,
        size: () => manifestJSON.length
      };

      //write the manifest to file (using fs - useful when using webpack-dev-middleware which prevents files from being written to disk)
      if (this.writeToDisk) {
        fs.writeFileSync(path.join(this.manifestFilename), manifestJSON);
      }

      callback();

    });
  }
}

module.exports = RevManifestPlugin;
