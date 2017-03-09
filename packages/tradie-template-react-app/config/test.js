process.env.NODE_ENV = 'test';

const fs = require('fs');
const path = require('path');

//TODO: paths, jsextensions

module.exports = options => {
  const config = {

    cacheDirectory: path.resolve('./tmp/jest'), //TODO:

    rootDir: path.resolve('./src'),
    testRegex: '\\.test\\.(jsx?)$',
    testPathIgnorePatterns: ['<rootDir>/_.test.js'],

    moduleFileExtensions: [
      'json', 'js', 'jsx'
    ],

    transform: {
      '\\.(js|jsx)?$': require.resolve('./lib/jest/scriptTransform'),
      '\\.css$': require.resolve('./lib/jest/styleTransform'),
      '^.*\\.(?!(json|js|jsx|css)$)[^.]+$': require.resolve('./lib/jest/fileTransform'),
      // transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'], //TODO: ignore node_modules outside src dir
    }

  };

  //add setup file if present
  if (fs.existsSync(path.resolve('./src', '_.test.js'))) {
    config.setupTestFrameworkScriptFile = path.resolve('./src', '_.test.js');
  }

  return {
    watch: options.watch,
    jest: config
  };
};