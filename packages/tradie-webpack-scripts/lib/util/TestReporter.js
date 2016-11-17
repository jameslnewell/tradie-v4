'use strict';
const clear = require('clear');
const chalk = require('chalk');
const formatWebpackMessages = require('./formatWebpackMessages');

class TestReporter {

  constructor(options) {
    this.debug = options && options.debug;
  }

  /**
   * @private
   */
  onStartCompiling() {

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
  onFinishCompiling(stats) {

    if (!this.debug) {
      clear();
    }

    const msgs = formatWebpackMessages(stats.toJson());

    if (msgs.errors.length) {  //TODO: use method from build reporter

      console.log();
      console.log(chalk.red('Compiled with errors'));
      console.log();
      this.errors.forEach((msg, i) => {
        console.error(`${chalk.underline.red(`Error #${i + 1}:`)} \n\n${msg}\n\n`);
        console.log();
      });

    } else if (msgs.warnings.length) {

      console.log();
      console.log(chalk.yellow('Compiled with warnings'));
      console.log();
      this.warnings.forEach((msg, i) => {
        console.error(`${chalk.underline.yellow(`Warning #${i + 1}:`)} \n\n${msg}\n\n`);
        console.log();
      });

    }

  }

  /**
   * @public
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

module.exports = TestReporter;