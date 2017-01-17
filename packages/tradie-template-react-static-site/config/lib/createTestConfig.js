'use strict';
const path = require('path');
const finder = require('finder-on-steroids');
const webpack = require('webpack');
const MochaWebpackPlugin = require('mocha-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const getPaths = require('./getPaths');
const createCommonConfig = require('./createCommonConfig');

module.exports = options => {

  const paths = getPaths(options.root);

  const builder = createCommonConfig({
    test: true,
    target: 'node',
    styles: 'ignore'
  });

  //find the test entries
  return finder(paths.src).files().name(/\.test\.js(x)?$/).find()
    .then(files => {

      //check for test files
      if (files.length === 0) {
        throw 'No files found matching `*.test.{js,jsx}`.';
      }

      //run the setup file first
      files.sort(fileA => {
        if (path.relative(paths.src, fileA) === '_.test.js') {
          return -1;
        } else {
          return 1;
        }
      });

      builder.merge({

        entry: {
          tests: [].concat(files)
        },

        //exclude `node_modules` because some have dynamic imports and don't bundle well, and we have nothing to gain
        // by bundling them for a test build - for a server bundle we may
        externals: [nodeExternals()],

        plugins: [
          new MochaWebpackPlugin({chunkName: 'tests'})
        ]

      });

      return builder.toObject();
    })
  ;

};
