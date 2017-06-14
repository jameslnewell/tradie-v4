const jest = require('jest');
const babel = require('babel-core');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object}  options
 * @param {object}  options.config
 * @param {boolean} [options.watch=false]
 * @param {boolean} [options.coverage=false]
 * @returns {Promise.<null>}
 */
module.exports = function(options) {
  return new Promise(() => {
    if (typeof options.config !== 'object') {
      //TODO: remove when typing all the things
      throw new Error('tradie-utils-jest: No config provided');
    }

    const args = ['--config', JSON.stringify(options.config)];

    if (options.watch) {
      args.push('--watch');
    }

    if (options.coverage) {
      args.push('--coverage');
    }

    //TODO: support other args

    //TODO: resolve() when completed. see https://github.com/facebook/jest/issues/3737.
    jest.run(args);
  });
};

module.exports.createBabelTransform = function(babelOptions) {
  return {
    process(src, file) {
      return babel.transform(src, Object.assign({filename: file}, babelOptions))
        .code;
    }
  };
};
