const path = require('path');
const chokidar = require('chokidar');
const finder = require('finder-on-steroids');

function createIncludeFilter(filter) {
  if (typeof filter === 'undefined') {
    return () => true;
  }

  if (filter instanceof RegExp) {
    return file => filter.test(file);
  }

  return filter;
}

function createExcludeFilter(filter) {
  if (typeof filter === 'undefined') {
    return () => false;
  }

  if (filter instanceof RegExp) {
    return file => filter.test(file);
  }

  return filter;
}

class Files {
  constructor(directory, options = {}) {
    this.directory = directory;
    this.includeFilter = createIncludeFilter(options.include);
    this.excludeFilter = createExcludeFilter(options.exclude);

    if (options.watch) {
      this.watcher = chokidar.watch(this.directory, {
        cwd: this.directory,
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
  include(file) {
    const fullFilePath = path.resolve(this.directory, file);
    const relFilePath = path.relative(this.directory, fullFilePath);
    return this.includeFilter(relFilePath) && !this.excludeFilter(relFilePath);
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
          .map(file => path.relative(this.directory, file))
      );
  }

  on(event, listener) {
    if (!this.watcher) {
      return this;
    }

    this.watcher.on(event, (file, ...args) => {
      if (this.include(file)) {
        listener(file, ...args);
      }
    });

    return this;
  }

  once(event, listener) {
    if (!this.watcher) {
      return this;
    }

    this.watcher.once(event, (file, ...args) => {
      if (this.include(file)) {
        listener(file, ...args);
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

module.exports = Files;
