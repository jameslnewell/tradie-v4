//@flow
import extend from 'extend';
import {type FileMap} from './types';
import VirtualFileSystem from './VirtualFileSystem';
import list from './list';
import diff from './diff';
import accept from './accept';
import apply from './apply';

export default function(directory: string, generate: FileMap => FileMap) {
  return list(directory).then(oldFiles => {
    // if (Object.keys(oldFiles).length) {
    //   throw new Error('Directory is not empty. Please run `tradie create` in an empty directory.');
    // }

    const newFiles = extend(true, {}, oldFiles);
    const vfs = new VirtualFileSystem({files: newFiles});
    return Promise.resolve(generate(vfs)).then(() => {
      const statuses = diff(oldFiles, newFiles);
      return accept(statuses, oldFiles, newFiles).then(accepted =>
        apply(directory, accepted, newFiles)
      );
    });
  });
}
