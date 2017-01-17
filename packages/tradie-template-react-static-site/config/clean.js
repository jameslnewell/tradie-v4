/* @flow weak */
'use strict';
const path = require('path');
const getPaths = require('./lib/getPaths');

module.exports = options => {
  const paths = getPaths(options.root);
  return {
    globs: [
      path.join(paths.tmp, '*'),
      path.join(paths.dest, '*')
    ]
  };
};
