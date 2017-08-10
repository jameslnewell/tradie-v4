// @flow
import Files from 'tradie-utils-file';
import Reporter from 'tradie-utils-reporter';

export type ProcessFileFunction = (file: string) => Promise<void>;
export type FilesProcessedFunction = () => Promise<void>;

export type ProcessorOptions = {
  /**
   * The files to process
   */
  files: Files,

  /**
   * The reporter to report to
   */
  reporter: Reporter,

  /**
   * Called when the source file is created or updated
   */
  onChange?: ProcessFileFunction,

  /**
   * Called when the source file has been removed
   */
  onRemove?: ProcessFileFunction,

  /**
   * Called when processing a group of files has finished
   */
  onFinished?: FilesProcessedFunction
};

export default class Processor {
  /** @private */
  files: Files;

  /** @private */
  reporter: Reporter;

  /** @private */
  onChange: ?ProcessFileFunction;

  /** @private */
  onRemove: ?ProcessFileFunction;

  /** @private */
  onFinished: ?FilesProcessedFunction;

  constructor(options: ProcessorOptions) {
    const {files, reporter, onChange, onRemove, onFinished} = options;

    this.files = files;
    this.reporter = reporter;
    this.onChange = onChange;
    this.onRemove = onRemove;
    this.onFinished = onFinished;

    if (onFinished) {
      this.reporter.before('finished', this.processedFiles);
    }

    this.files.on('add', this.processSingleFile);
    this.files.on('change', this.processSingleFile);
    this.files.on('unlink', this.cleanSingleFile);
  }

  /** @private */
  processMultipleFiles = () => {
    const onChange = this.onChange;
    if (!onChange) {
      return;
    }
    this.reporter.started();
    this.files
      .list()
      .then(files => Promise.all(files.map(file => onChange(file))))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  };

  /** @private */
  processSingleFile = (file: string) => {
    const onChange = this.onChange;
    if (!onChange) {
      return;
    }
    this.reporter.started();
    Promise.resolve()
      .then(() => onChange(file))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  };

  /** @private */
  cleanSingleFile = (file: string) => {
    const onRemove = this.onRemove;
    if (!onRemove) {
      return;
    }
    this.reporter.started();
    Promise.resolve()
      .then(() => onRemove(file))
      .then(
        () => this.reporter.finished(),
        error => this.reporter.errored(error)
      );
  };

  /** @private */
  processedFiles = () => {
    const onFinished = this.onFinished;
    if (!onFinished) {
      return Promise.resolve();
    }
    return Promise.resolve(onFinished()).then(
      () => {},
      error => {
        this.reporter.errored(error);
      }
    );
  };

  run() {
    this.processMultipleFiles();
    return this.reporter.wait();
  }

  stop() {
    this.files.close();
    this.reporter.stopping();
    return this;
  }
}
