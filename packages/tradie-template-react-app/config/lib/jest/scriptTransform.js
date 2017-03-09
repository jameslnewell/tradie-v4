'use strict';
const path = require('path');
const babelJest = require('babel-jest');
const getTestConfig = require('../babel/getTestConfig');

module.exports = babelJest.createTransformer(getTestConfig({
  optimize: false,
  tmp: path.resolve('./tmp') //FIXME
}));
