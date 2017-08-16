import fs from 'fs';
import path from 'path';
import getPaths from './utils/getPaths';

//TODO: use paths, jsextensions
//TODO: support coverage

export default options => {
  const paths = getPaths(options.root);

  const config = {
    cacheDirectory: path.join(paths.tmp, 'jest'),

    rootDir: path.resolve('./src'),
    testRegex: '\\.test\\.(jsx?)$',
    testPathIgnorePatterns: ['<rootDir>/_.test.js'],

    moduleFileExtensions: ['json', 'js', 'jsx'],

    transform: {
      '\\.(js|jsx)$': require.resolve('./lib/jest/scriptTransform'),
      '\\.css$': require.resolve('./lib/jest/styleTransform'),
      '^.*\\.(?!(json|js|jsx|css)$)[^.]+$': require.resolve(
        './lib/jest/fileTransform'
      )
      // transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'], //TODO: ignore node_modules outside src dir
    },

    collectCoverageFrom: ['**/*.{js,jsx}'],
    coverageDirectory: path.join(paths.tmp, 'coverage')
  };

  //add setup file if present
  if (fs.existsSync(path.resolve('./src', '_.test.js'))) {
    config.setupTestFrameworkScriptFile = path.resolve('./src', '_.test.js');
  }

  return {
    debug: options.debug,
    watch: options.watch,
    coverage: options.coverage,
    jest: config
  };
};
