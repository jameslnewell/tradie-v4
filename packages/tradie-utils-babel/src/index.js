import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import {transformFile} from 'babel-core';

export default class Transpiler {
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
      transformFile(srcFile, this.options || {}, (babelError, result) => {
        if (babelError) {
          reject(babelError); //TODO: strip stack trace
          return;
        }
        mkdirp(path.dirname(destFile), mkdirError => {
          if (mkdirError) {
            reject(mkdirError);
            return;
          }
          fs.writeFile(destFile, result.code, writeError => {
            if (writeError) {
              reject(writeError);
              return;
            }
            resolve();
          });
          // fs.writeFileSync(`${path.join(opts.dest, file)}.map`, result.map);
        });
      });
    });
  }
}
