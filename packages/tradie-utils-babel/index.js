const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const babel = require('babel-core');

class Transpiler {
  constructor(src, dest, options) {
    this.src = src;
    this.dest = dest;
    this.options = options;
  }

  srcFile(file) {
    return path.resolve(this.src, file);
  }

  destFile(file) {
    const pathinfo = path.parse(file);
    pathinfo.ext = '.js';
    return path.resolve(this.dest, path.format(pathinfo));
  }

  transpile(file) {
    return new Promise((resolve, reject) => {
      const srcFile = this.srcFile(file);
      const destFile = this.destFile(file);
      babel.transformFile(srcFile, this.options || {}, (babelError, result) => {
        if (babelError) return reject(babelError);
        mkdirp(path.dirname(destFile), mkdirError => {
          if (mkdirError) return reject(mkdirError);
          fs.writeFile(destFile, result.code, writeError => {
            if (writeError) return reject(writeError);
            return resolve();
          });
          // fs.writeFileSync(`${path.join(opts.dest, file)}.map`, result.map);
        });
      });
    });
  }
}

module.exports = Transpiler;
