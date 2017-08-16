// @flow
import path from 'path';
import chokidar from 'chokidar';
import finder from 'finder-on-steroids';
import match, {type Filter, type FilterFunction} from '@tradie/match-utils';

//FIXME: seems to be leaving a child process around

export type Options = {
  directory: string,
  watch?: boolean,
  include?: Filter,
  exclude?: Filter
};

export type EventListener = (file: string) => void;

export type {Filter};

export default class Files {
  /** @private */
  directory: string;

  /** @private */
  filter: FilterFunction;

  /** @private */
  watcher: any;

  constructor(options: Options) {
    const {
      directory,
      watch = false,
      include = () => true,
      exclude = () => false
    } = options;

    this.directory = directory;
    this.filter = match({
      directory,
      include,
      exclude
    });

    if (watch) {
      this.watcher = chokidar.watch(directory, {
        cwd: directory,
        ignoreInitial: true,
        disableGlobbing: true
      });
    }
  }

  /**
   * Get whether the file should be included in the collection
   * @param {string} file The file path
   * @returns {boolean}
   */
  include(file: string) {
    return this.filter(path.resolve(this.directory, file));
  }

  /**
   * List all the included files in the directory
   * @returns {Promise<string[]>} File paths are relative
   */
  list() {
    return finder(this.directory)
      .files()
      .find()
      .then(files =>
        files
          .filter(this.include.bind(this))
          .map(file => path.resolve(this.directory, file))
      );
  }

  on(event: string, listener: EventListener) {
    if (!this.watcher) {
      return this;
    }

    this.watcher.on(event, (file, ...args) => {
      if (this.include(file)) {
        listener(path.resolve(this.directory, file), ...args);
      }
    });

    return this;
  }

  once(event: string, listener: EventListener) {
    if (!this.watcher) {
      return this;
    }

    this.watcher.once(event, (file, ...args) => {
      if (this.include(file)) {
        listener(path.resolve(this.directory, file), ...args);
      }
    });

    return this;
  }

  close() {
    if (this.watcher) {
      this.watcher.close();
    }
    return this;
  }
}
