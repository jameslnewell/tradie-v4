const path = require('path');

/**
 * @param {string} root
 * @returns {{root: string, src: string, tmp: string, dest: string}}
 */
module.exports = root => ({
  root,
  src: path.join(root, 'src'),
  tmp: path.join(root, 'tmp'),
  dest: path.join(root, 'dist')
});
