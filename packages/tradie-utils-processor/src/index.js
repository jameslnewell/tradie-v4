/* eslint-disable no-invalid-this */
import Files from 'tradie-utils-file';
import Reporter from 'tradie-utils-reporter';

export default class Processor {
  /** @private */
  files = null;

  /** @private */
  reporter = null;

  /** @private */
  reportMethods = {
    hasErrors: () => {
      return this.reporter.hasErrors();
    },

    error: (file, ...args) => {
      if (this.files.include(file)) {
        this.reporter.error(file, ...args);
      }
    },

    hasWarnings: () => {
      return this.reporter.hasWarnings();
    },

    warning: (file, ...args) => {
      if (this.files.include(file)) {
        this.reporter.warning(file, ...args);
      }
    }
  };

  options = null;

  constructor(options) {
    const {
      directory,
      watch,
      include,
      exclude,
      startedText,
      finishedText
    } = options;

    this.files = new Files(directory, {
      watch,
      include,
      exclude
    });
    this.reporter = new Reporter({
      watching: watch,
      startedText,
      finishedText
    });
    this.options = options;
  }

  /** @private */
  processFiles() {
    this.reporter.started();
    return this.files
      .list()
      .then(files => this.options.processFiles(files, this.reportMethods))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  }

  /** @private */
  processFile(file) {
    if (!this.files.include(file)) {
      return Promise.resolve();
    }
    this.reporter.started();
    return Promise.resolve()
      .then(() => this.options.processFile(file, this.reportMethods))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  }

  run() {
    this.processFiles();

    if (this.options.watch) {
      this.files.on('add', this.processFile(this.options.onAddFile));
      this.files.on('change', this.processFile(this.options.onChangeFile));
      this.files.on('unlink', this.processFile(this.options.onUnlinkFile));
    }

    return this.reporter.wait();
  }

  stop() {
    this.files.close();
    return this;
  }
}
