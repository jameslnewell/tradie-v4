import * as fs from 'fs';
import * as path from 'path';
import {Arguments} from 'yargs';
import jest from '@tradie/jest-utils';
import {handleError} from '@tradie/cli-utils'
import { getPaths } from '../config/getPaths';
import { getGlobs } from '../config/getGlobs';

export const command = 'test';
export const describe = 'Run tests';
export const builder = {};
export const handler = handleError(async (argv: Arguments) => {
  const cwd = process.cwd();
  const paths = getPaths({cwd});
  const globs = getGlobs();

  const setupFiles = [];
  const codeSetupFile = path.join(cwd, paths.SOURCES_SRC, '_.test.ts');
  if (fs.existsSync(codeSetupFile)) {
    setupFiles.push(codeSetupFile);
  }
  const testSetupFile = path.join(cwd, paths.TESTS_SRC, '_.test.ts');
  if (fs.existsSync(testSetupFile)) {
    setupFiles.push(testSetupFile);
  }

  const jestConfig = {
    testEnvironment: 'node',
    rootDir: cwd,
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
      "^.+\\.tsx?$": require.resolve('../utils/babelJestTransform')
    },
    collectCoverageFrom: [
      `**/${globs.SOURCES}`,
      `!**/${globs.TESTS}`,
      `!**/${globs.MOCKS}`,
      `!**/${globs.FIXTURES}`
    ],
    setupFiles
  };

  await jest(argv as any, jestConfig);
});
