import fs from 'fs';
import path from 'path';

export default function(options = {}) {
  const root = options.root;
  const src = path.resolve(root, 'src'); //TODO: reuse paths
  const setupFile = path.join(src, '_.test.js');
  return {
    jest: {
      watch: options.watch,
      coverage: options.coverage,
      config: {
        testEnvironment: 'node',
        rootDir: src,
        testMatch: ['**/*.test.{js,jsx}'], //TODO: support integration tests in ./test??
        moduleFileExtensions: ['js', 'jsx'],
        transform: {
          '^.+\\.jsx?$': require.resolve('../lib/jest/babelTransform')
        },
        collectCoverageFrom: [
          '**/*.{js,jsx}',
          '!**/*.test.{js,jsx}',
          '!**/__mocks__/**'
        ],
        setupFiles: fs.existsSync(setupFile) ? [setupFile] : []
      }
    }
  };
}
