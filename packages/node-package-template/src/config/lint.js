import {
  SOURCE_FILES,
  FIXTURE_FILES,
  MOCK_FILES,
  TEST_FILES
} from './utils/globs';
import getPaths from './utils/paths';
import {getESLintConfig, getTestESLintConfig} from './utils/eslint';

export default function(options) {
  const {root, watch} = options;
  const paths = getPaths(root);
  const {src, dest} = paths;

  return {
    root,
    watch,
    eslint: [
      {
        include: SOURCE_FILES,
        exclude: [FIXTURE_FILES, MOCK_FILES, TEST_FILES],
        options: getESLintConfig(options)
      },
      {
        include: [FIXTURE_FILES, MOCK_FILES, TEST_FILES],
        options: getTestESLintConfig(options)
      }
    ],
    flow: [
      {
        include: SOURCE_FILES,
        src,
        dest
      }
    ]
  };
}
