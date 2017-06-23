import path from 'path';
import {REGEX_FILES, REGEX_TEST_FILES} from '../regex';
import getBabelConfig from '../getBabelConfig';
import getESLintConfig from '../getESLintConfig';

export default function(options) {
  const {root, watch} = options;
  return {
    root,
    src: path.resolve(root, './src'),
    dest: path.resolve(root, './lib'),
    include: REGEX_FILES,
    exclude: REGEX_TEST_FILES, //ignore test files i.e. `**/__mocks__/**` and `**/*.test.jsx`
    babel: getBabelConfig(options),
    eslint: getESLintConfig(options),
    watch
  };
}
