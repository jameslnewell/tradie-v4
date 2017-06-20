/* eslint-disable no-console */
import chalk from 'chalk';
import padStart from 'lodash.padstart';
import trim from 'lodash.trim';
import {clear} from 'tradie-utils-cli';

export default class Reporter {
  /** 
   * The number of compilations currently running
   * @private
   */
  running = 0;

  /**
   * The timeout to determine if we're still running 
   * @private 
   */
  runningTimeout = null;

  /** 
   * Whether the compilation is being stopped
   * @private
   */
  stopping = false;

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

  constructor(options = {watching: false}) {
    this.watching = options.watching;
    this.startedText = options.startedText || 'Building';
    this.finishedText = options.finishedText || 'Built';
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

    return this;
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
   * @param {*} error 
   * @param {*} priority 
   */
  error(file, error, priority = 0) {
    if (!this.errorsByFile[file]) {
      this.errorsByFile[file] = [];
    }

    this.errorsByFile[file] = {
      priority,
      message: error
    };

    return this;
  }

  hasWarnings() {
    return Object.keys(this.warningsByFile).length;
  }

  /**
   * Raise a warning message for a specific file
   * @param {*} file 
   * @param {*} error 
   * @param {*} priority 
   */
  warning(file, warning, priority = 0) {
    if (!this.warningsByFile[file]) {
      this.warningsByFile[file] = [];
    }

    this.warningsByFile[file] = {
      priority,
      message: warning
    };

    return this;
  }

  /**
   * Notify the reporter that a compilation has started
   */
  started() {
    ++this.running;

    //if this is the only compilation running, and we're not waiting for other compilations to start,
    // then print the start of the report
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

    //if this is the only compilation running, then wait to see if another compilation starts soon
    if (this.running === 0) {
      this.runningTimeout = setTimeout(() => {
        //clear the running timeout
        clearTimeout(this.runningTimeout);
        this.runningTimeout = null;

        //wait for the other running compilation to finish
        if (this.running > 0) {
          return;
        }

        //print the report
        this.printEndOfReport();

        //if all the compilations have finished, then resolve, if we are watching, only resolve if we're manually stopping
        if (this.watching) {
          if (this.stopping) {
            this.resolveOrReject();
          }
        } else {
          this.resolveOrReject();
        }
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
  stop() {
    //if there are no compilations running now, then resolve, otherwise resolve after the current compilations finish
    if (this.running === 0 && !this.runningTimeout) {
      this.resolveOrReject();
    } else {
      this.stopping = true;
    }

    return this;
  }

  wait() {
    //if there are no compilations running now, then resolve, otherwise wait until compilations finish
    if (!this.watching && this.running === 0 && !this.runningTimeout) {
      this.resolveOrReject();
    }

    return this.promise;
  }
}
