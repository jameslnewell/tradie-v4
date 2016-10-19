'use strict';
const clear = require('clear');
const chalk = require('chalk');
const uniq = require('lodash.uniq');
const formatWebpackMessages = require('./formatWebpackMessages');

class BuildReporter {

  constructor(options) {
    this.compiling = 0;
    this.errors = [];
    this.warnings = [];
    this.debug = options && options.debug;
  }

  /**
   * @private
   */
  onStartCompiling() {

    if (this.compiling === 0) {

      if (!this.debug) {
        clear();
      }

      console.log();
      console.log('Compiling...');
      console.log();

      this.errors = [];
      this.warnings = [];

    }

    ++this.compiling;
  }

  /**
   * @private
   */
  onFinishCompiling(stats) {

    const msgs = formatWebpackMessages(stats.toJson());
    this.errors = uniq(this.errors.concat(msgs.errors));
    this.warnings = uniq(this.warnings.concat(msgs.warnings));

    setImmediate(() => {
      --this.compiling;

      if (this.compiling === 0) {

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

    });

  }

  /**
   * @public
   * @param {object} compiler
   */
  observe(compiler) {

    compiler.plugin('compile', () => {
      this.onStartCompiling();
    });

    compiler.plugin('done', stats => {
      this.onFinishCompiling(stats);
    });

  }

}

module.exports = BuildReporter;