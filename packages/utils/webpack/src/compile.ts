import * as webpack from 'webpack';
import CancelablePromise from '@jameslnewell/cancelable-promise';
import Reporter from '@tradie/reporter-utils';
import {run} from './utils/run';

export interface CompileOptions {
  config: webpack.Configuration;
  reporter: Reporter;
}

export function compile(options: CompileOptions): CancelablePromise<void> {
  const {config, reporter} = options;

  const compiler = webpack(config);

  const createCompiler = () => compiler;
  const startCompiling = () => compiler.run(() => {/* do nothing */});
  const stopCompiling = () => {/* do nothing */};

  return run({reporter, createCompiler, startCompiling, stopCompiling});
}
