import * as Webpack from 'webpack';
import Reporter from '@tradie/reporter-utils';
import CancelablePromise from '@jameslnewell/cancelable-promise';
import {extractMessageDetails} from './extractMessageDetails';

const pluginName = '@tradie/webpack-utils';

export interface RunCompilerOptions {
  reporter: Reporter;
  createCompiler: () => Webpack.Compiler | PromiseLike<Webpack.Compiler>;
  startCompiling: () => void | PromiseLike<void>;
  stopCompiling: () => void | PromiseLike<void>;
}

export function run({reporter, createCompiler, startCompiling, stopCompiling}: RunCompilerOptions): CancelablePromise<void> {
  return new CancelablePromise<void>((resolve, reject) => {
    Promise.resolve(createCompiler()).then(compiler => {
      let isWatching = false;

      compiler.hooks.run.tap(pluginName, () => { // async
        reporter.started();
      });

      compiler.hooks.watchRun.tap(pluginName, () => { // async
        isWatching = true;
        reporter.started();
      });

      compiler.hooks.watchClose.tap(pluginName, () => {
        reporter.stopping();
        resolve();
      });

      compiler.hooks.failed.tap(pluginName, (error: Error) => {
        reporter.failed(error);
        reject(error);
      });

      compiler.hooks.done.tap(pluginName, (stats: Webpack.Stats) => { // async
        const cwd = compiler.options.context;
        const json = stats.toJson({
          errors: true,
          errorDetails: true,
          warnings: true
        });
        json.errors.forEach((error: string) => {
          const {file, message} = extractMessageDetails(error, {cwd});
          reporter.log({
            type: 'error',
            text: message,
            file: file || undefined,
          });
        });
        json.warnings.forEach((warning: string) => {
          const {file, message} = extractMessageDetails(warning, {cwd});
          reporter.log({
            type: 'warn',
            text: message,
            file: file || undefined,
          });
        });
        reporter.finished();

        if (!isWatching) {
          reporter.stopping();
        }
      });

      return startCompiling();
    }).then(resolve, reject);

    return () => {
      stopCompiling();
    };
  });
}
