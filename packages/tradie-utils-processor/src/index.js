// @flow
import Files, {type Filter} from 'tradie-utils-file';
import Reporter from 'tradie-utils-reporter';

export type Options = {
  watch?: boolean,
  include?: Filter,
  exclude?: Filter,

  process?: (file: string, report: any) => Promise<any>,
  unlink?: (file: string, report: any) => Promise<any>,
  postProcessing?: (report: any) => Promise<any>,

  startedText: string,
  finishedText: string
};

export default class Processor {
  /** @private */
  files: Files;

  /** @private */
  reporter: Reporter;

  /** @private */
  options: Options;

  /** @private */
  reportMethods = {
    hasErrors: () => this.reporter.hasErrors(),

    error: (file: string, ...args: any) => {
      if (this.files.include(file)) {
        this.reporter.error(file, ...args);
      }
    },

    hasWarnings: () => this.reporter.hasWarnings(),

    warning: (file: string, ...args: any) => {
      if (this.files.include(file)) {
        this.reporter.warning(file, ...args);
      }
    }
  };

  constructor(directory: string, options: Options) {
    const {
      watch = false,
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
      watch,
      directory,
      startedText,
      finishedText,
      beforeFinished: this.postProcessing.bind(this)
    });

    this.options = options;
  }

  /** @private */
  processFiles() {
    const fn = this.options.process;
    if (!fn) {
      return;
    }
    this.reporter.started();
    this.files
      .list()
      .then(files =>
        Promise.all(files.map(file => fn(file, this.reportMethods)))
      )
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  }

  /** @private */
  processFile(file: string) {
    const fn = this.options.process;
    if (!fn) {
      return;
    }
    this.reporter.started();
    Promise.resolve()
      .then(() => fn(file, this.reportMethods))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  }

  /** @private */
  unlinkFile(file: string) {
    const fn = this.options.unlink;
    if (!fn) {
      return;
    }
    this.reporter.started();
    Promise.resolve()
      .then(() => fn(file, this.reportMethods))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  }

  /** @private */
  postProcessing() {
    const fn = this.options.postProcessing;
    if (!fn) {
      return Promise.resolve();
    }
    return Promise.resolve().then(() => fn(this.reportMethods));
  }

  run() {
    this.processFiles();

    if (this.options.watch) {
      this.files.on('add', this.processFile.bind(this));
      this.files.on('change', this.processFile.bind(this));
      this.files.on('unlink', this.unlinkFile.bind(this));
    }

    return this.reporter.wait();
  }

  stop() {
    this.files.close();
    return this;
  }
}
