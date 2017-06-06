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
    return () => true;
  }

  if (filter instanceof RegExp) {
    return file => !filter.test(file);
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
    return this.includeFilter(file) && this.excludeFilter(file);
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
    if (this.watcher) this.watcher.on(event, listener.bind(this));
    return this;
  }

  once(event, listener) {
    if (this.watcher) this.watcher.once(event, listener.bind(this));
    return this;
  }

  close() {
    if (this.watcher) this.watcher.close();
    return this;
  }
}

module.exports = Files;
