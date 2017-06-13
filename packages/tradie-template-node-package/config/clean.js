const path = require('path');

module.exports = function(options) {
  return {
    paths: path.resolve(options.root, './lib')
  };
}