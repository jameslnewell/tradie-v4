'use strict';
const chalk = require('chalk');
const jest = require('jest');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object}  options
 * @param {string}  [options.root]
 * @param {boolean} [options.debug=false]
 * @param {boolean} [options.watch=false]
 * @param {object}  options.jest
 * @returns {Promise.<null>}
 */
module.exports = options =>
  new Promise((resolve, reject) => {
    const watch = options.watch;
    const coverage = options.coverage;
    const config = options.jest;

    if (!config) {
      console.error( //eslint-disable-line no-console
        chalk.red('Tradie template does not provide a test configuration.')
      );
      reject(1);
      return;
    }

    const args = ['--config', JSON.stringify(config)];

    if (watch) {
      args.push('--watch');
    }

    if (coverage) {
      args.push('--coverage');
    }

    jest.run(args);
  });
