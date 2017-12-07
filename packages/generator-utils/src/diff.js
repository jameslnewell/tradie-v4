// @flow
import {type File, type FileMap, type FileStatusMap} from './types';

export type DiffOptions = {
  changed?: (oldFile: File, newFile: File) => boolean
};

/**
 * Calculate which files have changed
 * @param {FileMap} oldFiles
 * @param {FileMap} newFiles
 * @param {DiffOptions} [options]
 */
export default function(
  oldFiles: FileMap,
  newFiles: FileMap,
  options: DiffOptions = {}
): FileStatusMap {
  const {changed = (oldFile, newFile) => oldFile.contents !== newFile.contents} = options;

  const statuses: FileStatusMap = {};

  //check for added or modified files
  Object.keys(newFiles).forEach(filePath => {
    const newFile = newFiles[filePath];
    const oldFile = oldFiles[filePath];
    if (oldFile) {
      if (changed(oldFile, newFile)) {
        statuses[filePath] = 'M';
      }
    } else {
      statuses[filePath] = 'A';
    }
  });

  //check for deleted files
  Object.keys(oldFiles).forEach(filePath => {
    const newFile = newFiles[filePath];
    if (!newFile) {
      statuses[filePath] = 'D';
    }
  });

  //sort statuses
  return Object.keys(statuses)
    .sort()
    .reduce((s, filePath) => {
      s[filePath] = statuses[filePath];
      return s;
    }, {});
}
