import * as fs from 'fs';
import * as path from 'path';
import { Arguments } from 'yargs';

export function test({argv, root}: {argv: Arguments, root: string}): any {
  const setupFiles = [];
  const codeSetupFile = path.join(root, 'src/_.test.ts');
  if (fs.existsSync(codeSetupFile)) {
    setupFiles.push(codeSetupFile);
  }
  const testSetupFile = path.join(root,  'test/_.test.ts');
  if (fs.existsSync(testSetupFile)) {
    setupFiles.push(testSetupFile);
  }
  return {
    rootDir: root,
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
      '^.+\\.tsx?$': require.resolve('../utils/babelTransform')
    },
    collectCoverageFrom: [
      `**/src/**/*.{ts,tsx}`,
      `!**/{src,test}/**/*.test.{ts,tsx}`,
      `!**/{src,test}/**/__mocks__/**/*.{ts,tsx}`,
      `!**/{src,test}/**/__fixtures__/**/*`
    ],
    setupFiles,
  };
}
