'use strict';
const clear = require('clear');
const chalk = require('chalk');
const formatWebpackMessages = require('./formatWebpackMessages');

class TestReporter {

  onStartCompiling() {

    clear();

    console.log();
    console.log('Compiling...');
    console.log();

  }

  onFinishCompiling(stats) {

    clear();

    const msgs = formatWebpackMessages(stats.toJson());

    if (msgs.errors.length) {

      console.log();
      console.log(chalk.red('Compiled with errors'));
      console.log();
      msgs.errors.forEach(msg => {
        console.error(msg);
        console.log();
      });

    } else if (msgs.warnings.length) {

      console.log();
      console.log(chalk.yellow('Compiled with warnings'));
      console.log();
      msgs.warnings.forEach(msg => {
        console.error(msg);
        console.log();
      });

    }

  }

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