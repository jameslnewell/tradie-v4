// @flow
/* eslint-disable no-console */
import chalk from 'chalk';
import {clear} from '@tradie/cli-utils';
import {type Data, type Record} from './log/types';
import Collector from './log/Collector';
import {formatLogs} from './log/formatting';

export type Options = {
  watch?: boolean,
  context?: string,
  startedText?: string,
  finishedText?: string
};

export type EventHandler = () => void | Promise<void>;

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
  context: ?string;

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

  /** @private */
  logs: Collector = new Collector();

  /** @private */
  events: {[name: string]: EventHandler[]} = {};

  constructor(options: Options = {}) {
    const {watch = false, context, startedText = 'Starting', finishedText = 'Finished'} = options;

    this.context = context;
    this.watch = watch;

    this.startedText = startedText;
    this.finishedText = finishedText;
  }

  /** @private */
  resolveOrReject() {
    if (this.hasErrors() && this.reject) {
      if (this.reject) this.reject();
    } else if (!this.hasErrors() && this.resolve) {
      if (this.resolve) this.resolve();
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
  printMessages(level: string) {
    console.log(
      formatLogs(this.logs.filter(log => log.level === level), {
        cwd: this.context
      })
    );
  }

  /** @private */
  printEndOfReport() {
    clear();
    console.log();
    this.printMessages('info');
    if (this.hasErrors()) {
      this.printMessages('error');
      console.log(chalk.red(chalk.bold(`  ❌  ${this.finishedText} with errors`)));
    } else if (this.hasWarnings()) {
      this.printMessages('warn');
      console.log(chalk.yellow(chalk.bold(`  ⚠️  ${this.finishedText} with warnings`)));
    } else {
      console.log(chalk.green(`  ✅  ${this.finishedText} successfully.`));
    }
    console.log();

    return this;
  }

  /** @private */
  trigger(type: string): Promise<void> {
    if (!this.events[type]) {
      return Promise.resolve();
    }
    return Promise.all(this.events[type].map(fn => fn())).then(() => {});
  }

  before(event: string, fn: EventHandler) {
    const type = `before:${event}`;
    if (!this.events[type]) {
      this.events[type] = [];
    }
    this.events[type].push(fn);
    return this;
  }

  after(event: string, fn: EventHandler) {
    const type = `after:${event}`;
    if (!this.events[type]) {
      this.events[type] = [];
    }
    this.events[type].push(fn);
    return this;
  }

  hasInfo() {
    return this.logs.filter(log => log.level === 'info').length > 0;
  }

  hasWarnings() {
    return this.logs.filter(log => log.level === 'warn').length > 0;
  }

  hasErrors() {
    return this.logs.filter(log => log.level === 'error').length > 0;
  }

  log(record: Record) {
    this.logs.log(record);
    return this;
  }

  info(data: Data) {
    this.logs.info(data);
    return this;
  }

  warning(data: Data) {
    this.logs.warn(data);
    return this;
  }

  error(data: Data) {
    this.logs.error(data);
    return this;
  }

  /**
   * Notify the reporter that a compilation has started
   */
  start() {
    ++this.running;

    //if this is the first compilation running, and we're not waiting for other compilations to start then
    if (this.running === 1 && !this.runningTimeout) {
      //clear the logs
      this.logs.clear();

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
  finish() {
    --this.running;

    //if this is the only compilation running, then we'll wait to see if another compilation starts soon so we don't print
    // a million success messages
    if (this.running === 0) {
      this.runningTimeout = setTimeout(async () => {
        //clear the running timeout
        clearTimeout(this.runningTimeout);
        this.runningTimeout = null;

        //wait for any running compilations to finish
        if (this.running || this.runningTimeout) {
          return;
        }

        //let the caller do stuff before the report is printed
        try {
          await this.trigger('before:finished');
        } catch (error) {
          this.errored(error);
        }

        //wait for any running compilations to finish
        if (this.running || this.runningTimeout) {
          return;
        }

        //print the end of the report
        this.printEndOfReport();

        //let the caller do stuff after the report is printed
        try {
          await this.trigger('after:finished');
        } catch (error) {
          this.errored(error);
        }

        //if we're not watching and all the compilations have finished, then resolve or reject
        if (!this.watch && !this.running && !this.runningTimeout) {
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
  errored(error: any) {
    if (this.reject) this.reject(error);
    return this;
  }

  /**
   * Notify the reporter that the compilation is stopping now, or at the end of the current compilation
   */
  stop() {
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
    if (!this.promise) {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;

        //if we're not watching and there are no running compilations, then resolve or reject now
        if (!this.watch && !this.running && !this.runningTimeout) {
          this.resolveOrReject();
        }
      });
    }

    return this.promise;
  }
}
