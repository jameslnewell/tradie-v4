'use strict';
const debug = require('debug')('tradie-webpack-scripts');
const clear = require('clear');
const chalk = require('chalk');
const wfe = require('wait-for-event');
const uniq = require('lodash.uniq');
const formatWebpackMessages = require('./formatWebpackMessages');

class BuildReporter {

  constructor(options) {
    this.errors = [];
    this.warnings = [];
    this.compiling = 0;
    this.debug = options && options.debug;

    this.observe(options.bundlers);

  }

  /**
   * @private
   */
  printStartMessage() {

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
  printFinishMessage() {

    if (!this.debug) {
      clear();
    }

    if (this.errors.length) {

      console.log();
      console.log(chalk.red('Compiled with errors'));
      console.log();
      this.errors.forEach(msg => {
        console.error(msg);
        console.log();
      });

    } else if (this.warnings.length) {

      console.log();
      console.log(chalk.yellow('Compiled with warnings'));
      console.log();
      this.warnings.forEach(msg => {
        console.error(msg);
        console.log();
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

    const msgs = formatWebpackMessages(stats.toJson());
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
        .on('start', () => {
          debug(`starting ${bundler.name} bundle...`);

          if (this.compiling === 0) {
            this.printStartMessage();
          }

          ++this.compiling;
        })
        .on('finish', stats => {
          debug(`finished ${bundler.name} bundle`);

          this.collateStats(stats);

          //wait to next tick to allow the next compilation to start before we say compilation is finished
          setImmediate(() => {
            --this.compiling;

            if (this.compiling === 0) {
              this.clearStats();
              this.printFinishMessage();
            }

          });

        })
      ;

    });

  }

}

module.exports = BuildReporter;