import getPaths from '../paths';
import {SOURCE_FILES, MOCK_FILES, TEST_FILES} from '../globs';
import {getESLintConfig, getTestESLintConfig} from '../eslint';

export default function(options) {
  const {root, watch} = options;
  return {
    watch,
    ...getPaths(root),

    sourceOptions: {
      include: SOURCE_FILES,
      exclude: [MOCK_FILES, TEST_FILES],
      eslint: getESLintConfig(options)
    },

    testOptions: {
      include: [MOCK_FILES, TEST_FILES],
      eslint: getTestESLintConfig(options)
    }
  };
}
