const path = require('path');
const getBabelConfig = require('../lib/getBabelConfig');

module.exports = function(options) {
  return {
    root: options.root,
    src: path.resolve(options.root, './src'),
    dest: path.resolve(options.root, './lib'),
    include: /\.jsx?$/,
    exclude: /\.test\.jsx?$/,
    babel: getBabelConfig(options),
    eslint: {
      extends: ['jameslnewell/es'],
      env: {node: true},
      rules: {
        'no-console': 1
      }
    },
    watch: options.watch
  };
};
