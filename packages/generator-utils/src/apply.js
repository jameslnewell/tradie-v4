// @flow
import path from 'path';
import fs from 'fs-extra';
import {type FileMap, type FileStatusMap} from './types';

/**
 * Apply differences to disk
 * @param {string} dest
 * @param {FileStatusMap} statuses
 * @param {FileMap} oldFiles
 * @param {FileMap} newFiles
 */
export default function(dest: string, statuses: FileStatusMap, newFiles: FileMap) {
  return Promise.all(
    Object.keys(statuses).map(filePath => {
      const status = statuses[filePath];
      const destFilePath = path.resolve(dest, filePath);
      switch (status) {
        case 'A':
        case 'M':
          return fs
            .ensureDir(path.dirname(destFilePath))
            .then(() => fs.writeFile(destFilePath, newFiles[filePath].contents));

        case 'D':
          return fs.unlink(destFilePath);

        default:
          return Promise.reject('Unknown status');
      }
    })
  );
}
