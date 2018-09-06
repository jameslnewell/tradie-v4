import * as fs from 'fs';
import * as path from 'path';
import jest from '@tradie/jest-utils';

import * as paths from '../config/paths';
import * as globs from '../config/globs';

export default async function (argv: {}) {
  const root = process.cwd();

  const setupFiles = [];
  const codeSetupFile = path.join(root, paths.CODE_SRC, '_.test.ts');
  if (fs.existsSync(codeSetupFile)) {
    setupFiles.push(codeSetupFile);
  }
  const testSetupFile = path.join(root, paths.TESTS_SRC, '_.test.ts');
  if (fs.existsSync(testSetupFile)) {
    setupFiles.push(testSetupFile);
  }

  const config = {
    testEnvironment: 'node',
    rootDir: root,
    testMatch: [`**/${globs.TESTS}`],
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/src/_\\.test\\.ts$', //ignore the test setup file
      '<rootDir>/test/_\\.test\\.ts$', //ignore the test setup file
      '<rootDir>/.*/__fixtures__/', //ignore test files within fixtures
      '<rootDir>/.*/__mocks__/' //ignore test files within mocks
    ],
    moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'json'],
    transform: {
      "^.+\\.tsx?$": require.resolve('../config/babelTransform')
    },
    collectCoverageFrom: [
      `**/${globs.SOURCES}`,
      `!**/${globs.TESTS}`,
      `!**/${globs.MOCKS}`,
      `!**/${globs.FIXTURES}`
    ],
    setupFiles
  };

  await jest(argv, config);
}
