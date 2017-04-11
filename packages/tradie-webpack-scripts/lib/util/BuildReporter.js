'use strict';
const clear = require('./clearScreen');
const chalk = require('chalk');
const uniq = require('lodash.uniq');
const formatWebpackMessages = require('./formatWebpackMessages');

class BuildReporter {

  constructor(options) {
    this.compiling = false;

    this.debug = options.debug;
    this.server = options.server;
    this.bundlers = options.bundlers;

    this.clearStats();
    this.observe(this.bundlers);

    if (this.server) {
      this.server.on('started', (_, port) => setImmediate(() => { //HACK: to make it appear after compiling message which also uses setImmediate
        console.log(chalk.blue(`Server running at http://localhost:${port}`));
      }));
    }

  }

  /**
   * @private
   */
  printStartedMessage() {

    if (!this.debug) {
      clear();
    }

    console.log();
    console.log('Compiling...');
    console.log();

  }

  /**
   * @private
   */
  printCompletedMessage() {

    if (!this.debug) {
      clear();
    }

    if (this.errors.length) {

      console.log();
      console.log(chalk.red('Compiled with errors'));
      console.log();
      this.errors.forEach((msg, i) => {
        console.error(`${chalk.underline.red(`Error #${i + 1}:`)} \n\n${msg}\n\n`);
      });

    } else if (this.warnings.length) {

      console.log();
      console.log(chalk.yellow('Compiled with warnings'));
      console.log();
      this.warnings.forEach((msg, i) => {
        console.error(`${chalk.underline.yellow(`Warning #${i + 1}:`)} \n\n${msg}\n\n`);
      });

    } else {

      console.log();
      console.log(chalk.green('Compiled successfully'));
      console.log();

    }

  }

  /**
   * @private
   */
  clearStats() {

    //clear the errors
    this.errors = [];
    this.warnings = [];

  }

  /**
   * @private
   */
  collateStats(stats) {

    //FIXME: linting and other errors may be duplicated when multiple bundles use the same source files - de-dupe them
    let msgs;
    if (this.debug) {
      //show full stack traces
      msgs = {
        errors: stats.compilation.errors.map(error => (error.stack ? `${error.message}\n${error.stack}` : error)),
        warnings: stats.compilation.warnings
      };
    } else {
      //show formatted messages
      msgs = formatWebpackMessages({
        errors: stats.compilation.errors.map(error => error.message || error),
        warnings: stats.compilation.warnings
      });
    }
    this.errors = uniq(this.errors.concat(msgs.errors));
    this.warnings = uniq(this.warnings.concat(msgs.warnings));

  }

  /**
   * @private
   * @param {Array.<object>} bundlers
   */
  observe(bundlers) {

    bundlers.forEach(bundler => {

      bundler
        .on('started', () => {

          //if this is the first bundler compiling, clear the screen and show the started message
          if (!this.compiling) {
            this.clearStats();
            this.printStartedMessage();
          }

          this.compiling = true;
        })
        .on('completed', stats => {
          this.collateStats(stats);

          //wait to next tick to allow the next bundler to start compiling before we show the completed message
          setImmediate(() => {

            //if there are no bundlers compiling, clear the screen and show the completed message
            if (this.bundlers.every(bundler => !bundler.isCompiling())) {
              this.compiling = false;
              this.printCompletedMessage();
            }

          });

        })
      ;

    });

  }

}

module.exports = BuildReporter;
