'use strict';
const path = require('path');

module.exports = options => {
  return {
    context: path.join(options.root, 'src'),
    entry: {
      index: './index.js'
    },
    output: {
      path: path.join(options.root),
      filename: 'test.js'
    }
  };
};
