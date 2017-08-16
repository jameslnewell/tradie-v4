'use strict';

class CollectFilesPlugin {
  constructor(options) {
    this.manifest = (options && options.cache) || [];
  }

  apply(compiler) {
    // const publicPath = compiler.options.output.publicPath;
    //TODO: remove previous files

    compiler.plugin('emit', (compilation, callback) => {
      //create a dictionary to store the the entry files
      if (!this.manifest.entry) {
        this.manifest.entry = {};
      }

      //create a dictionary to store the the async files
      if (!this.manifest.async) {
        this.manifest.async = {};
      }

      //TODO: dedupe and remove assets that are no longer part of the output

      compilation.chunks.forEach(chunk => {
        //add files from entry or async chunks
        if (chunk.hasRuntime() || chunk.isInitial()) {
          chunk.files.forEach(filename => {
            //exclude `*.map` files and `*.hot-update.js` files
            if (
              filename.endsWith('.map') ||
              filename.endsWith('.hot-update.js')
            ) {
              return;
            }

            //create an array to store the the files for this entry chunk
            if (!this.manifest.entry[chunk.name]) {
              this.manifest.entry[chunk.name] = [];
            }

            //add the file to the array of files for this entry chunk
            if (!this.manifest.entry[chunk.name].includes(filename)) {
              this.manifest.entry[chunk.name].push(filename);
            }
          });
        } else {
          chunk.files.forEach(filename => {
            //exclude `*.map` files and `*.hot-update.js` files
            if (
              filename.endsWith('.map') ||
              filename.endsWith('.hot-update.js')
            ) {
              return;
            }

            //create an array to store the the files for this async chunk
            if (!this.manifest.async[chunk.id]) {
              this.manifest.async[chunk.id] = [];
            }

            //add the file to the array of files for this entry chunk
            if (!this.manifest.async[chunk.id].includes(filename)) {
              this.manifest.async[chunk.id].push(filename);
            }
          });
        }
      });

      callback();
    });
  }
}

module.exports = CollectFilesPlugin;
