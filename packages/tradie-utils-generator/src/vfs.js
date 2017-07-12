//@flow
import {type FileMap} from './types';

export type Options = {
  files?: FileMap
};

export function create(opts: Options = {}) {
  const files: FileMap = opts.files || {};

  /**
   * Normalise the filename
   * @param {string} file 
   */
  const normalise = file => file;

  const vfs = {
    list(): string[] {
      return Object.keys(files);
    },

    exists(file: string): boolean {
      const filename = normalise(file);
      return Boolean(files[filename]);
    },

    read(file: string): string {
      const filename = normalise(file);
      if (!files[filename]) {
        throw new Error(`File "${filename}" not found.`);
      }
      return files[filename].contents;
    },

    readJSON(file: string): any {
      return JSON.parse(vfs.read(file));
    },

    write(file: string, contents: string) {
      const filename = normalise(file);
      if (!files[filename]) {
        files[filename] = {contents: ''};
      }
      files[filename].contents = contents;
    },

    writeJSON(file: string, contents: any) {
      vfs.write(file, JSON.stringify(contents, null, 2));
    },

    delete(file: string) {
      const filename = normalise(file);
      delete files[filename];
    }
  };

  return vfs;
}
