import fs from 'fs';
import path from 'path';
import jest from '@tradie/jest-utils';

import * as paths from '../config/paths';
import * as globs from '../config/globs';

export default function(argv) {
  const {watch, coverage} = argv;

  const setupFiles = [];
  const codeSetupFile = path.join(paths.CODE_SRC, '_.test.js');
  if (fs.existsSync(codeSetupFile)) {
    setupFiles.push(codeSetupFile);
  }
  const testSetupFile = path.join(paths.TESTS_SRC, '_.test.js');
  if (fs.existsSync(testSetupFile)) {
    setupFiles.push(testSetupFile);
  }

  return jest(
    {
      watch,
      coverage
    },
    {
      testEnvironment: 'node',
      rootDir: paths.ROOT,
      testMatch: [`**/${globs.TESTS}`],
      testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/src/_\\.test\\.js$', //ignore the test setup file
        '<rootDir>/test/_\\.test\\.js$' //ignore the test setup file
      ],
      moduleFileExtensions: ['jsx', 'js'],
      transform: {
        '^.+\\.jsx?$': require.resolve('../config/jest/babelTransform')
      },
      mapCoverage: true,
      collectCoverageFrom: [
        `**/${globs.SOURCES}`,
        `!**/${globs.TESTS}`,
        `!**/${globs.MOCKS}`,
        `!**/${globs.FIXTURES}`
      ],
      setupFiles
    }
  );
}
