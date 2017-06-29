import getPaths from './utils/paths';
import {
  SOURCE_FILES,
  FIXTURE_FILES,
  MOCK_FILES,
  TEST_FILES
} from './utils/globs';
import {getBabelConfig} from './utils/babel';
import {getESLintConfig} from './utils/eslint';

export default function(options) {
  const {root, watch} = options;
  return {
    watch,
    ...getPaths(root),
    include: SOURCE_FILES,
    exclude: [FIXTURE_FILES, MOCK_FILES, TEST_FILES],
    babel: getBabelConfig(options),
    eslint: getESLintConfig(options)
  };
}
