import * as webpack from 'webpack';
import Reporter from '@tradie/reporter-utils';
import CancelablePromise from '@jameslnewell/cancelable-promise';
import {run} from './utils/run';

export interface WatchOptions {
  config: webpack.Configuration;
  reporter: Reporter;
}

export function watch(options: WatchOptions): CancelablePromise<void> {
  const {config, reporter} = options;
  let compiler: webpack.Compiler | undefined;
  let watcher: webpack.Watching | undefined;

  const createCompiler = () => {
    compiler = webpack(config);
    return compiler;
  };

  const startCompiling = () => {
    if (compiler) {
      watcher = compiler.watch({}, () => {/* do nothing */});
    }
  };

  const stopCompiling = () => {
    return new Promise<void>((resolve) => {
      if (watcher) {
        watcher.close(resolve);
      }
    });
  };

  return run({reporter, createCompiler, startCompiling, stopCompiling});
}
