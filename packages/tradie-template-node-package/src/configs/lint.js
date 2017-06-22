import path from 'path';
import {REGEX_FILES, REGEX_TEST_FILES} from '../regex';
import getESLintConfig from '../getESLintConfig';

export default function(options) {
  const {root} = options;

  const src = path.resolve(root, './src');
  const dest = path.resolve(root, './lib');

  return {
    root,
    src,
    dest,
    eslint: [
      {
        include: REGEX_FILES,
        exclude: REGEX_TEST_FILES,
        config: getESLintConfig()
      },
      {
        include: REGEX_TEST_FILES,
        config: getESLintConfig(true)
      }
    ],
    watch: options.watch
  };
}
