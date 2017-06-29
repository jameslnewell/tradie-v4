import getPaths from './utils/paths';
import {
  SOURCE_FILES,
  FIXTURE_FILES,
  MOCK_FILES,
  TEST_FILES
} from './utils/globs';
import {getESLintConfig, getTestESLintConfig} from './utils/eslint';

export default function(options) {
  const {root, watch} = options;
  return {
    watch,
    ...getPaths(root),

    sourceOptions: {
      include: SOURCE_FILES,
      exclude: [FIXTURE_FILES, MOCK_FILES, TEST_FILES],
      eslint: getESLintConfig(options)
    },

    testOptions: {
      include: [FIXTURE_FILES, MOCK_FILES, TEST_FILES],
      eslint: getTestESLintConfig(options)
    }
  };
}
