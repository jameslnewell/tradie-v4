'use strict';
const path = require('path');
const babelJest = require('babel-jest');
const getTestConfig = require('../getBabelTestConfig');

module.exports = babelJest.createTransformer(getTestConfig({
  optimize: false,
  root: path.resolve('.') //TODO: fixme
}));
