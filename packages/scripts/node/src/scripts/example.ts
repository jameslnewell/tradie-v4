
import * as register from '@babel/register';
import babelOptions from '../config/babelOptions';
import runner from './example-runner';

export default async function (options: { module: string }) {
  const { module = 'index' } = options;
  const cwd = process.cwd();

  register({
    ...babelOptions,
    cwd,
    extensions: ['.tsx', '.ts']
  });

  runner(cwd, module);
}
