// @flow
/* eslint-disable no-console */
import path from 'path';
import chalk from 'chalk';
import {clear} from 'tradie-utils-cli';
import printMessages from './printMessages';

type Message = {
  content: Error | string,
  priority: number
};

const noop = () => {
  /* do nothing */
};

export type Options = {
  watch?: boolean,
  directory?: string,
  startedText?: string,
  finishedText?: string,
  beforeFinished?: () => any,
  afterFinished?: () => any
};

export default class Reporter {
  /** 
   * The number of compilations currently in progress
   * @private
   */
  running = 0;

  /**
   * The timeout to determine if we're still running 
   * @private 
   */
  runningTimeout = null;

  /** @private */
  directory: ?string;

  /** @private */
  errorsByFile = {};

  /** @private */
  warningsByFile = {};

  /** @private */
  promise = null;

  /** @private */
  resolve = null;

  /** @private */
  reject = null;

  /** @private */
  watch = false;

  /**
   * The text printed when compilation has started
   * @private
   */
  startedText: string;

  /**
   * The text printed when compilation has finished
   * @private
   */
  finishedText: string;

  /**
   * A function executed before the compilation has finished and the messages have been printed
   * @private
   */
  beforeFinished: () => any;

  /**
   * A function executed after the compilation has finished and the messages have been printed
   * @private
   */
  afterFinished: () => any;

  constructor(options: Options = {}) {
    const {
      watch = false,
      directory,
      startedText = 'Starting',
      finishedText = 'Finished',
      beforeFinished = noop,
      afterFinished = noop
    } = options;

    this.directory = directory;
    this.watch = watch;
    this.startedText = startedText;
    this.finishedText = finishedText;
    this.beforeFinished = beforeFinished;
    this.afterFinished = afterFinished;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  /** @private */
  resolveOrReject() {
    if (this.hasErrors() && this.reject) {
      this.reject();
    } else if (!this.hasErrors() && this.resolve) {
      this.resolve();
    }
  }

  /** @private */
  printStartOfReport() {
    clear();
    console.log();
    console.log(`  ${this.startedText}...`);
    console.log();
  }

  /** @private */
  printMessages(type: string, messages: {[file: string]: Array<Message>}) {
    Object.keys(messages).forEach(file => {
      //make the path relative to the directory
      let filename = file;
      if (this.directory) {
        filename = path.relative(this.directory, file); //eslint-disable-line no-param-reassign
      }

      printMessages(type, filename, messages[file]);
    });
  }

  /** @private */
  printEndOfReport() {
    clear();
    console.log();
    if (this.hasErrors()) {
      this.printMessages('error', this.errorsByFile);
      console.log(
        chalk.red(chalk.bold(`  ❌  ${this.finishedText} with errors`))
      );
    } else if (this.hasWarnings()) {
      this.printMessages('warn', this.warningsByFile);
      console.log(
        chalk.red(chalk.bold(`  ⚠️  ${this.finishedText} with warnings`))
      );
    } else {
      console.log(chalk.green(`  ✅  ${this.finishedText} successfully.`));
    }
    console.log();

    return this;
  }

  hasErrors() {
    return Object.keys(this.errorsByFile).length;
  }

  /**
   * Raise an error message for a specific file
   * @param {string} file 
   * @param {Error|string} message 
   * @param {number} priority 
   */
  error(file: string, message: Error | string, priority: number = 0) {
    if (!this.errorsByFile[file]) {
      this.errorsByFile[file] = [];
    }

    this.errorsByFile[file].push({
      priority,
      content: message
    });

    return this;
  }

  hasWarnings() {
    return Object.keys(this.warningsByFile).length;
  }

  /**
   * Raise a warning message for a specific file
   * @param {string} file 
   * @param {Error|string} message 
   * @param {number} priority 
   */
  warning(file: string, message: Error | string, priority: number = 0) {
    if (!this.warningsByFile[file]) {
      this.warningsByFile[file] = [];
    }

    this.warningsByFile[file].push({
      priority,
      content: message
    });

    return this;
  }

  /**
   * Notify the reporter that a compilation has started
   */
  started() {
    ++this.running;

    //if this is the first compilation running, and we're not waiting for other compilations to start then
    if (this.running === 1 && !this.runningTimeout) {
      //clear errors and warnings
      this.errorsByFile = {};
      this.warningsByFile = {};

      //print the start of the report
      this.printStartOfReport();
    }

    //clear the running timeout
    clearTimeout(this.runningTimeout);
    this.runningTimeout = null;

    return this;
  }

  /**
   * Notify the reporter that a compilation has finished
   */
  finished() {
    --this.running;

    //if this is the only compilation running, then we'll wait to see if another compilation starts soon so we don't print
    // a million success messages
    if (this.running === 0) {
      this.runningTimeout = setTimeout(() => {
        //clear the running timeout
        clearTimeout(this.runningTimeout);
        this.runningTimeout = null;

        //wait for any running compilations to finish
        if (this.running || this.runningTimeout) {
          return;
        }

        //let the caller do stuff before the report is printed
        Promise.resolve(this.beforeFinished()).then(
          () => {
            //wait for any running compilations to finish
            if (this.running || this.runningTimeout) {
              return Promise.resolve();
            }

            //print the end of the report
            this.printEndOfReport();

            //let the caller do stuff after the report is printed
            return Promise.resolve(this.afterFinished()).then(() => {
              //if we're not watching and all the compilations have finished, then resolve or reject
              if (!this.watch && !this.running && !this.runningTimeout) {
                this.resolveOrReject();
              }
            });
          },
          error => this.errored(error)
        );
      }, 100);
    }

    return this;
  }

  /**
   * A fatal error occurred. Stop immedietly.
   * @param {Error} error 
   */
  errored(error: any) {
    if (this.reject) this.reject(error);
    return this;
  }

  /**
   * Notify the reporter that the compilation is stopping now, or at the end of the current compilation
   */
  stopping() {
    //if there are no running compilations, then resolve or reject now (watching has already stopped)
    if (!this.running && !this.runningTimeout) {
      this.resolveOrReject();
    } else {
      this.watch = false;
    }
    return this;
  }

  /**
   * Wait until all the running compilations have stopped and we're no longer watching
   */
  wait() {
    //if we're not watching and there are no running compilations, then resolve or reject now
    if (!this.watch && !this.running && !this.runningTimeout) {
      this.resolveOrReject();
    }
    return this.promise;
  }
}
