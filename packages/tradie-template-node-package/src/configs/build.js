import getPaths from '../paths';
import {SOURCE_FILES, MOCK_FILES, TEST_FILES} from '../globs';
import {getBabelConfig} from '../babel';
import {getESLintConfig} from '../eslint';

export default function(options) {
  const {root, watch} = options;
  return {
    watch,
    ...getPaths(root),
    include: SOURCE_FILES,
    exclude: [MOCK_FILES, TEST_FILES],
    babel: getBabelConfig(options),
    eslint: getESLintConfig(options)
  };
}
