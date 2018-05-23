import { FileMap } from './types';

/**
 * Normalise the filename
 * @param {string} file
 */
const normalise = (file: string): string => file;

export interface VirtualFileSystemOptions {
  files?: FileMap
};

export default class VirtualFileSystem {

  private files: FileMap;

  constructor(opts: VirtualFileSystemOptions = {}) {
    this.files = opts.files || {};
  }

  list(): string[] {
    return Object.keys(this.files);
  }

  exists(file: string): boolean {
    const filename = normalise(file);
    return Boolean(this.files[filename]);
  }

  read(file: string): string {
    const filename = normalise(file);
    if (!this.files[filename]) {
      throw new Error(`File "${filename}" not found.`);
    }
    return this.files[filename].contents;
  }

  readJSON(file: string): any {
    return JSON.parse(this.read(file));
  }

  write(file: string, contents: string) {
    const filename = normalise(file);
    if (!this.files[filename]) {
      this.files[filename] = { contents };
    } else {
      this.files[filename].contents = contents;
    }
    return this;
  }

  writeJSON(file: string, contents: any) {
    this.write(file, JSON.stringify(contents, null, 2));
  }

  delete(file: string) {
    const filename = normalise(file);
    delete this.files[filename];
    return this;
  }
}
