'use strict';
const path = require('path');

module.exports = options => {
  return {
    context: path.join(options.root, 'src'),
    entry: {
      tests: './index.js'
    },
    output: {
      path: options.root,
      filename: '[name].js'
    }
  };
};
