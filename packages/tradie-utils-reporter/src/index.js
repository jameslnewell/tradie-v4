/* eslint-disable no-console */
import chalk from 'chalk';
import padStart from 'lodash.padstart';
import trim from 'lodash.trim';
import {clear} from 'tradie-utils-cli';

const noop = () => {
  /* do nothing */
};

const defaultOptions = {
  watching: false,
  startedText: 'Starting',
  finishedText: 'Finished',
  beforeFinished: noop,
  afterFinished: noop
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
  watching = false;

  constructor(options = {}) {
    const {
      watching,
      startedText,
      finishedText,
      beforeFinished,
      afterFinished
    } = {...defaultOptions, ...options};
    this.watching = watching;
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
    if (this.hasErrors()) {
      this.reject();
    } else {
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
  printMessages(type, messages) {
    Object.keys(messages).forEach(file => {
      //TODO: filter so only top priority errors are shown e.g. show babel errors over eslint

      let bgColor = null;
      switch (type) {
        case 'error':
          bgColor = 'bgRed';
          break;
        case 'warn':
          bgColor = 'bgYellow';
          break;
        default:
          bgColor = 'bgBlack';
          break;
      }

      console.log(chalk[bgColor](chalk.white(` in ${chalk.bold(file)}: `)));
      console.log();
      console.log(
        `${trim(
          String(
            messages[file].message instanceof Error
              ? messages[file].message.stack
              : messages[file].message
          )
            .split('\n')
            .map(line => `${padStart('', 4)}${line}`)
            .join('\n'),
          '\n'
        )}`
      );
      console.log();
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
   * @param {*} file 
   * @param {*} message 
   * @param {*} priority 
   */
  error(file, message, priority = 0) {
    if (!this.errorsByFile[file]) {
      this.errorsByFile[file] = [];
    }

    this.errorsByFile[file] = {
      priority,
      message
    };

    return this;
  }

  hasWarnings() {
    return Object.keys(this.warningsByFile).length;
  }

  /**
   * Raise a warning message for a specific file
   * @param {*} file 
   * @param {*} message 
   * @param {*} priority 
   */
  warning(file, message, priority = 0) {
    if (!this.warningsByFile[file]) {
      this.warningsByFile[file] = [];
    }

    this.warningsByFile[file] = {
      priority,
      message
    };

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
        Promise.resolve(this.beforeFinished).then(
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
              if (!this.watching && !this.running && !this.runningTimeout) {
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
  errored(error) {
    this.reject(error);
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
      this.watching = false;
    }
    return this;
  }

  /**
   * Wait until all the running compilations have stopped and we're no longer watching
   */
  wait() {
    //if we're not watching and there are no running compilations, then resolve or reject now
    if (!this.watching && !this.running && !this.runningTimeout) {
      this.resolveOrReject();
    }
    return this.promise;
  }
}
