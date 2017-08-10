import path from 'path';
import {
  SOURCE_FILES,
  EXAMPLE_FILES,
  TEST_FILES,
  MOCK_FILES,
  FIXTURE_FILES
} from './utils/paths';
import * as eslint from './utils/eslint';
import * as babel from './utils/babel';
import * as rollup from './utils/rollup';
import getBuildConfig from './utils/webpack/getBuildConfig';

export default function(cliOptions) {
  const {root} = cliOptions;

  const src = path.join(root, 'src');
  const include = SOURCE_FILES;
  const exclude = [TEST_FILES, MOCK_FILES, FIXTURE_FILES];

  return {
    root,
    eslint: [
      {
        include: [].concat(include, EXAMPLE_FILES),
        exclude,
        options: eslint.getSourceConfig()
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
    flow: [
      {
        include,
        exclude,
        src,
        dest: path.join(root, 'dist/cjs')
      },
      {
        include,
        exclude,
        src,
        dest: path.join(root, 'dist/es')
      }
    ],
    rollup: [
      //FIXME: fix named exports for UMD
      rollup.getUMDOptions({root, optimized: false}),
      rollup.getUMDOptions({root, optimized: true})
    ],
    webpack: getBuildConfig({root})
  };
}
