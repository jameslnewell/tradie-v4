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
module.exports = options => new Promise((resolve, reject) => {
  const watch = options.watch;
  const config = options.jest;

  if (!config) {
    console.error(chalk.red('Tradie template does not provide a test configuration.'));
    return reject(1);
  }

  jest.run([
    watch ? '--watch' : '',
    '--config',
    JSON.stringify(config)
  ]);

});
