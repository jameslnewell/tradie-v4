/* tslint:disable no-console member-ordering */
import chalk from 'chalk';
import { clear } from '@tradie/cli-utils';
import { MessageType } from './MessageType';
import { Message } from './Message';
import { formatMessages } from './formatting';

const RUNNING_TIMEOUT = 250;

export type EventHandler = () => void | Promise<void>;

export interface Options {
  watch?: boolean;
  context?: string;
  startedText?: string;
  finishedText?: string;
};

export class Reporter {

  /**
   * The number of compilations currently in progress
   */
  private running = 0;
  private runningByFile: {[name: string]: number} = {};

  /**
   * The timeout to determine if we're still running
   */
  private runningTimeout?: NodeJS.Timer;

  private context?: string;

  private promise?: Promise<void>;

  private resolve?: (value?: void | PromiseLike<void>) => void;

  private reject?: (reason?: any) => void;

  private messages: Message[] = [];

  private events: { [name: string]: EventHandler[] } = {};

  private isWatching: boolean;

  /**
   * The text printed when compilation has started
   */
  private readonly startedText: string;

  /**
   * The text printed when compilation has finished
   */
  private readonly finishedText: string;

  constructor(options: Options = {}) {
    const { watch = false, context, startedText = 'Starting', finishedText = 'Finished' } = options;

    this.context = context;
    this.isWatching = watch;

    this.startedText = startedText;
    this.finishedText = finishedText;
  }

  private createPromise() {
    if (!this.promise) {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
    return this.promise;
  }

  private resolveOrReject() {
    if (this.hasErrors() && this.reject) {
      this.reject();
    } else if (!this.hasErrors() && this.resolve) {
      this.resolve();
    }
  }

  private printStartOfReport() {
    clear();
    console.log();
    console.log(`  ${this.startedText}...`);
    console.log();
  }

  private printMessages(type: MessageType) {
    console.log(
      formatMessages(this.messages.filter(log => log.type === type), {
        cwd: this.context
      })
    );
  }

  private printEndOfReport() {
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

  private trigger(event: string): Promise<void> {
    if (!this.events[event]) {
      return Promise.resolve();
    }
    return Promise.all(this.events[event].map(fn => fn())).then(() => {/* do nothing */ });
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

  hasInformation() {
    return this.messages.filter(message => message.type === 'info').length > 0;
  }

  hasWarnings() {
    return this.messages.filter(message => message.type === 'warn').length > 0;
  }

  hasErrors() {
    return this.messages.filter(message => message.type === 'error').length > 0;
  }

  log(messageOrMessages: Message | Message[]) {
    if (Array.isArray(messageOrMessages)) {
      messageOrMessages.forEach(message => this.messages.push(message));
    } else {
      this.messages.push(messageOrMessages);
    }
    return this;
  }

  private clearLogs(file?: string) {
    if (file === undefined) {
      this.messages = [];
    } else {
      this.messages = this.messages.filter(message => message.file !== file);
    }
  }

  /**
   * Returns true when:
   *  - compilation hasn't started
   *  - compilation has finished
   */
  private isCompilationRunning(): boolean {
    const isGlobalCompilationRunning = this.running > 0;
    const isFileCompilationRunning = Object.keys(this.runningByFile).reduce((total, file) => total += this.runningByFile[file], 0) > 0;
    return isGlobalCompilationRunning || isFileCompilationRunning;
  }

  /**
   * Returns true when:
   *  - compilation has finished and we're waiting to see if another compilation will start
   */
  private isCompilationWaiting() {
    return Boolean(this.runningTimeout);
  }

  /**
   * Notify the reporter that a compilation has started
   */
  started(file?: string) {

    //if this is the first compilation running, and we're not waiting for other compilations to start then
    if (!this.isCompilationRunning() && !this.isCompilationWaiting()) {
      //clear the logs
      this.clearLogs(file);
      //print the start of the report
      this.printStartOfReport();
    }

    if (file == undefined) {
      ++this.running;
    } else {
      ++this.runningByFile[file];
    }

    //restart the running timeout
    if (this.isCompilationWaiting()) {
      clearTimeout(this.runningTimeout);
      this.runningTimeout = undefined;
    }

    return this;
  }

  /**
   * Notify the reporter that a compilation has finished
   */
  finished(file?: string) {
    if (file === undefined) {
      --this.running;
    } else {
      --this.runningByFile[file];
    }

    //if this is the only compilation running, then we'll wait to see if another compilation starts soon so we don't print
    // a million success messages
    if (!this.isCompilationRunning()) {
      this.runningTimeout = setTimeout(async () => {
        //clear the running timeout
        if (this.runningTimeout) {
          clearTimeout(this.runningTimeout);
          this.runningTimeout = undefined;
        }

        //wait for any running compilations to finish
        if (this.isCompilationRunning() || this.isCompilationWaiting()) {
          return;
        }

        //let the caller do stuff before the report is printed
        try {
          await this.trigger('before:finished');
        } catch (error) {
          this.failed(error);
        }

        //wait for any running compilations to finish
        if (this.isCompilationRunning() || this.isCompilationWaiting()) {
          return;
        }

        //print the end of the report
        this.printEndOfReport();

        //let the caller do stuff after the report is printed
        try {
          await this.trigger('after:finished');
        } catch (error) {
          this.failed(error);
        }

        //if we're not watching and all the compilations have finished, then resolve or reject
        if (!this.isWatching && !this.isCompilationRunning() && !this.isCompilationWaiting()) {
          this.resolveOrReject();
        }
      }, RUNNING_TIMEOUT);
    }

    return this;
  }

  /**
   * Notify the reporter that a compilation has failed
   * @param {Error} error
   */
  failed(error: any) {
    this.createPromise();
    const { reject } = this;
    if (reject) {
      reject(error);
    }
    return this;
  }

  /**
   * Notify the reporter that the compilation is stopping now, or at the end of the current compilation
   */
  stopping() {
    //if there are no running compilations, then resolve or reject now (watching has already stopped)
    if (!this.isCompilationRunning() && !this.isCompilationWaiting()) {
      this.resolveOrReject();
    } else {
      this.isWatching = false;
    }
    return this;
  }

  /**
   * Wait until all the running compilations have stopped and we're no longer watching
   */
  wait(): Promise<void> {
    const promise = this.createPromise();

    //if we're not watching and there are no running compilations, then resolve or reject now
    if (!this.isWatching && !this.isCompilationRunning() && !this.isCompilationWaiting()) {
      this.resolveOrReject();
    }

    return promise;
  }
}
