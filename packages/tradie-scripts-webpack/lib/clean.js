'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = function(options) {
  return (0, _promisedDel2.default)(options.globs);
};

var _promisedDel = require('promised-del');

var _promisedDel2 = _interopRequireDefault(_promisedDel);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
