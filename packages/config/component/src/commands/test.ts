import * as fs from 'fs';
import * as path from 'path';
import { Arguments } from 'yargs';
import { PackageInfo } from '@tradie/yarn-utils';

export function test({argv, root, workspaces}: {argv: Arguments, root: PackageInfo, workspaces: PackageInfo[]}): any {

  // TODO: change setup file locations based on whether there are workspaces
  const setupFiles = [];
  const codeSetupFile = path.join(root.path, 'src/_.test.js');
  if (fs.existsSync(codeSetupFile)) {
    setupFiles.push(codeSetupFile);
  }
  const testSetupFile = path.join(root.path,  'test/_.test.js');
  if (fs.existsSync(testSetupFile)) {
    setupFiles.push(testSetupFile);
  }

  // TODO: change globs based on whether there are workspaces
  return {
    rootDir: root.path,
    testMatch: [`**/{src,test}/**/*.test.{ts,tsx}`],
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/src/_\\.test\\.ts$', //ignore the test setup file
      '<rootDir>/test/_\\.test\\.ts$', //ignore the test setup file
      '<rootDir>/.*/__fixtures__/', //ignore test files within fixtures
      '<rootDir>/.*/__mocks__/' //ignore test files within mocks
    ],
    moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'json'],
    transform: {
      '^.+\\.tsx?$': require.resolve('ts-jest')
    },
    collectCoverageFrom: [
      `**/src/**/*.{ts,tsx}`,
      `!**/{src,test}/**/*.test.{ts,tsx}`,
      `!**/{src,test}/**/__mocks__/**/*.{ts,tsx}`,
      `!**/{src,test}/**/__fixtures__/**/*`
    ],
    setupFiles,
    globals: {
      'ts-jest': {
        tsConfigFile: require.resolve('../utils/typescript/tsconfig.tests.json'),
        // enableTsDiagnostics: true // too slow
      }
    }
  };

}
