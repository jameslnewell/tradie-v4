import * as path from 'path';
import * as fs from 'fs-extra';
import { FileMap, FileStatusMap } from './types';

/**
 * Apply differences to disk
 */
export default function (dest: string, statuses: FileStatusMap, newFiles: FileMap) {
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
