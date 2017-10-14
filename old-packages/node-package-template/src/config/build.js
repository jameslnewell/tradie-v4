import {
  SOURCE_FILES,
  FIXTURE_FILES,
  MOCK_FILES,
  TEST_FILES
} from './utils/globs';
import getPaths from './utils/paths';
import {getBabelConfig} from './utils/babel';
import {getESLintConfig} from './utils/eslint';

export default function(options) {
  const {root, watch} = options;
  const paths = getPaths(root);
  const {src, dest} = paths;

  const include = SOURCE_FILES;
  const exclude = [FIXTURE_FILES, MOCK_FILES, TEST_FILES];

  return {
    root,
    watch,
    eslint: [
      {
        include,
        exclude,
        options: getESLintConfig(options)
      }
    ],
    babel: [
      {
        include,
        exclude,
        src,
        dest,
        options: getBabelConfig(options)
      }
    ],
    flow: [
      {
        include,
        exclude,
        src,
        dest
      }
    ]
  };
}
