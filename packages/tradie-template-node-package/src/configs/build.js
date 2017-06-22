import path from 'path';
import {REGEX_FILES, REGEX_TEST_FILES} from '../regex';
import getBabelConfig from '../getBabelConfig';
import getESLintConfig from '../getESLintConfig';

export default function(options) {
  return {
    root: options.root,
    src: path.resolve(options.root, './src'),
    dest: path.resolve(options.root, './lib'),
    include: REGEX_FILES,
    exclude: REGEX_TEST_FILES, //ignore test files i.e. `**/__mocks__/**` and `**/*.test.jsx`
    babel: getBabelConfig(options),
    eslint: [
      {
        include: REGEX_FILES,
        include: REGEX_TEST_FILES,
        config: getESLintConfig()
      }
    ],
    watch: options.watch
  };
}
