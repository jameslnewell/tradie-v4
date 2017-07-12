import fs from 'fs';
import path from 'path';
import getPaths from './utils/paths';
import {
  SOURCE_FILES,
  FIXTURE_FILES,
  MOCK_FILES,
  TEST_FILES
} from './utils/globs';

export default function(options = {}) {
  const {root, watch, coverage} = options;
  const {src} = getPaths(root);

  const setupFiles = [];
  if (fs.existsSync(path.join(src, '_.test.js'))) {
    setupFiles.push('<rootDir>/src/_.test.js');
  }
  if (fs.existsSync(path.join(root, 'test/_.test.js'))) {
    setupFiles.push('<rootDir>/test/_.test.js');
  }

  return {
    jest: {
      watch,
      coverage,
      config: {
        testEnvironment: 'node',

        rootDir: root,

        testMatch: [`**/${TEST_FILES}`],

        testPathIgnorePatterns: [
          '<rootDir>/node_modules/',
          '<rootDir>/src/_\\.test\\.js$', //ignore the test setup file
          '<rootDir>/test/_\\.test\\.js$' //ignore the test setup file
        ],

        moduleFileExtensions: ['js', 'jsx'],

        transform: {
          '^.+\\.jsx?$': require.resolve('./utils/jestBabelTransform')
        },

        mapCoverage: coverage,
        collectCoverageFrom: [
          `**/${SOURCE_FILES}`,
          `!**/${FIXTURE_FILES}`,
          `!**/${MOCK_FILES}`,
          `!**/${TEST_FILES}`
        ],

        setupFiles
      }
    }
  };
}