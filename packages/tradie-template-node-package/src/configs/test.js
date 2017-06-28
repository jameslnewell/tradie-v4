import fs from 'fs';
import path from 'path';
import getPaths from '../paths';

//TODO: reuse globs

export default function(options = {}) {
  const {root, watch} = options;
  const {src} = getPaths(root);
  const setupFile = path.join(src, '_.test.js');
  return {
    jest: {
      watch,
      coverage: options.coverage,
      config: {
        testEnvironment: 'node',
        rootDir: src,
        testMatch: ['**/*.test.{js,jsx}'], //TODO: support integration tests in ./test??
        moduleFileExtensions: ['js', 'jsx'],
        transform: {
          '^.+\\.jsx?$': require.resolve('../jestBabelTransform')
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
