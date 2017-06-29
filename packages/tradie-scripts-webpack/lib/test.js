'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _jest = require('jest');

var _jest2 = _interopRequireDefault(_jest);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Run webpack on multiple bundles and display the results
 * @param {object}  options
 * @param {string}  [options.root]
 * @param {boolean} [options.debug=false]
 * @param {boolean} [options.watch=false]
 * @param {object}  options.jest
 * @returns {Promise.<null>}
 */
exports.default = function(options) {
  return new Promise(function(resolve, reject) {
    var watch = options.watch;
    var coverage = options.coverage;
    var config = options.jest;

    if (!config) {
      console.error(
        //eslint-disable-line no-console
        _chalk2.default.red(
          'Tradie template does not provide a test configuration.'
        )
      );
      reject(1);
      return;
    }

    var args = ['--config', JSON.stringify(config)];

    if (watch) {
      args.push('--watch');
    }

    if (coverage) {
      args.push('--coverage');
    }

    _jest2.default.run(args);
  });
};
