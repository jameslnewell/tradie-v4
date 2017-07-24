//@flow
import path from 'path';
import fs from 'fs-extra';
import {transformFile} from 'babel-core';

export function getDestPath(file: string, src: string, dest: string) {
  //keep the same path in the dest dir
  const relFilePath = path.relative(src, file);
  const destFilePath = path.join(dest, relFilePath);

  //replace the extension with JS
  const pathinfo = path.parse(destFilePath);
  return path.format({
    ...pathinfo,
    ext: '.js'
  });
}

export default function(file: string, src: string, dest: string, options: {}) {
  return new Promise((resolve, reject) => {
    const destFilePath = getDestPath(file, src, dest);
    transformFile(file, {...options, filename: file}, (error, result) => {
      if (error) {
        reject(error); //TODO: strip stack trace
      } else {
        fs
          .mkdirs(path.dirname(destFilePath))
          .then(() => fs.writeFile(destFilePath, result.code))
          // .then(() => fs.writeFile(`${destFilePath}.map`, result.map))
          .then(resolve, reject);
      }
    });
  });
}
