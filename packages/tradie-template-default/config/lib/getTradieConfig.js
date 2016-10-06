'use strict';
const fs = require('fs');
const path = require('path');
const JSON5 = require('json5');
const EventEmitter = require('events').EventEmitter;

const defaults = {

  src: './src/',
  dest: './dist/',
  tmp: './tmp',

  script: {
    bundles: ['./index.js'],
    vendors: [],
    extensions: ['.js'],
    outputFilename: null
  },

  style: {
    extensions: ['.css', '.scss'],
    outputFilename: null
  },

  asset: {
    extensions: [
      '.jpg', '.png', '.gif', '.svg',
      '.eot', '.ttf', '.woff', '.woff2'
    ],
    outputFilename: null
  },

  eslint: {},
  babel: {},

  plugins: [],

  //extra webpack config... try not to use this, it won't be portable if we switch tooling
  webpack: {}

};

const readESLintConfig = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, '.eslintrc'), (readFileError, content) => {
      if (readFileError) return resolve({});
      try {
        resolve(JSON5.parse(content.toString()));
      } catch (jsonParseError) {
        reject(new TradieError('Unable to read ".eslintrc"', jsonParseError));
      }
    });
  });
};

const readBabelConfig = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, '.babelrc'), (readFileError, content) => {
      if (readFileError) return resolve({});
      try {
        resolve(JSON5.parse(content.toString()));
      } catch (jsonParseError) {
        reject(new TradieError('Unable to read ".babelrc"', jsonParseError));
      }
    });
  });
};

const readTradieConfig = (dir, args) => {
  return new Promise((resolve, reject) => {
    const userConfigPath = path.join(dir, 'tradie.config.js');
    try {

      let userConfigData = require(userConfigPath);

      if (typeof userConfigData === 'function') {
        userConfigData = userConfigData(args);
      }

      resolve(userConfigData);

    } catch (requireError) {
      if (requireError.code === 'MODULE_NOT_FOUND') {

        //if the file does not exist, then ignore the error, otherwise it is a user config error
        fs.stat(userConfigPath, err => {
          if (err) {

            //ignore the error if the user config file does not exist
            resolve({});

          } else {

            //throw an error if the user config file exists but errors whilst executing it
            reject(new TradieError('Unable to read "tradie.config.js"', requireError));

          }
        });

      } else {

        //throw an error if the user config file exists but errors whilst executing it
        reject(new TradieError('Unable to read "tradie.config.js"', requireError));

      }
    }
  });
};

const readFromFile = (args) => {
  const dir = process.cwd();

  //read the user's tradie config
  return readTradieConfig(dir, args)
    .then(userConfig => {
      const promises = [];

      //if the user hasn't provided config for eslint, try and load it from a file
      if (!userConfig.eslint) {
        promises.push(readESLintConfig(dir).then(eslint => ({eslint})))
      }

      //if the user hasn't provided config for babel, try and load it from a file
      if (!userConfig.babel) {
        promises.push(readBabelConfig(dir).then(babel => ({babel})))
      }

      //merge the eslint and babel configs into the user's tradie config
      return Promise.all(promises)
        .then(results => results.reduce((accum, next) => {
          return Object.assign({}, accum, next);
        }, userConfig))
        ;
    })
    ;

};

const shallowMerge = (objA, objB) => {

  //make a copy of objA
  const config = Object.assign({}, objA);

  Object.keys(objB).forEach(key => {
    if (Array.isArray(objB[key]) && Array.isArray(objA[key])) {
      config[key] = [].concat(objA[key], objB[key]);
    } else if (typeof objB[key] === 'object' && typeof objA[key] === 'object') {
      config[key] = Object.assign({}, objA[key], objB[key]);
    } else {
      config[key] = objB[key];
    }
  });

  return config;
};


module.exports = args => {
  const emitter = new EventEmitter();

  const baseConfig = Object.assign({}, defaults, args, {root: process.cwd()}); //FIXME: find the tradie.config.js file?


  //read the user config from file
  return readFromFile(args)
    .then(userConfig => shallowMerge(baseConfig, userConfig))
    .then(config => Object.assign({}, config, {

      //resolve paths
      root: path.resolve(config.root),
      src: path.resolve(config.root, config.src),
      dest: path.resolve(config.root, config.dest),
      tmp: path.resolve(config.root, config.tmp),

    }))
  ;

};
