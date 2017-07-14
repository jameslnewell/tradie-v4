import fs from 'fs-extra';
import path from 'path';
import {
  SOURCE_FILES,
  TEST_FILES,
  MOCK_FILES,
  FIXTURE_FILES
} from './utils/paths';
import * as eslint from './utils/eslint';
import * as babel from './utils/babel';
import * as rollup from './utils/rollup';
import * as webpack from './utils/webpack';

export default function(cliOptions) {
  const {root} = cliOptions;

  const src = path.join(root, 'src');
  const include = SOURCE_FILES;
  const exclude = [TEST_FILES, MOCK_FILES, FIXTURE_FILES];

  return {
    root,
    eslint: [
      {
        include,
        exclude,
        options: eslint.getSourceOptions()
      }
    ],
    babel: [
      {
        include,
        exclude,
        src,
        dest: path.join(root, 'dist/cjs'),
        options: babel.getCommonJSOptions()
      },
      {
        include,
        exclude,
        src,
        dest: path.join(root, 'dist/es'),
        options: babel.getESModuleOptions()
      }
    ],
    rollup: [
      rollup.getUMDOptions({root, optimized: false}),
      rollup.getUMDOptions({root, optimized: true})
    ],
    webpack: webpack.getOptions({root})
  };
}
