
import * as path from 'path';
import {Arguments} from 'yargs';
import * as register from '@babel/register';
import {handleError} from '@tradie/cli-utils'
import { getPaths } from '../config/getPaths';
import { getBabelOptions } from '../config/getBabelOptions';
import run from '../utils/run';

export const command = 'example [module]';
export const describe = 'Run an example';
export const builder = {};
export const handler = handleError(async (argv: Arguments) => {
  const { module = 'index' } = argv;
  const cwd = process.cwd();
  const paths = getPaths({cwd});
  const babelOptions = getBabelOptions();

  register({
    ...babelOptions.examples,
    cwd,
    extensions: ['.tsx', '.ts']
  });

  // this is simply a wrapper around `import()` because *.tsx? files need to be executed in
  // a different file to the one that `register()` is called in
  run(`${path.join(cwd, paths.EXAMPLES_SRC)}/${module}`);
});
