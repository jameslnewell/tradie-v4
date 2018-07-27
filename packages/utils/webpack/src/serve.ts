import * as webpack from 'webpack';
import * as createWebpackServer from 'webpack-serve';
import CancelablePromise from '@jameslnewell/cancelable-promise';
import Reporter from '@tradie/reporter-utils';
import {run} from './utils/run';

const DEBUG = Boolean(process.env.DEBUG);

export interface ServeOptions {
  config: webpack.Configuration;
  reporter: Reporter;
}

export function serve(options: ServeOptions): CancelablePromise<void> {
  const {config, reporter} = options;
  let compiler: webpack.Compiler | undefined;
  let server: createWebpackServer.Instance | undefined;

  const createCompiler = async () => {
    compiler = webpack({...config, stats: 'none'});
    return compiler;
  };

  const startCompiling = async () => {
    //@ts-ignore - types for webpack-serve don't allow `logLevel: 'silent'`
    server = await createWebpackServer({
      config,
      content: compiler && compiler.options && compiler.options.output && compiler.options.output.path || '',
      dev: {
        stats: DEBUG ? true : false,
        logLevel: DEBUG ? 'debug' : 'silent',
        publicPath: compiler && compiler.options && compiler.options.output && compiler.options.output.publicPath || '/',
      },
      hot: {
        logLevel: DEBUG ? 'debug' : 'silent',
      },
      port: 3000,
      compiler,
      logLevel: DEBUG ? 'debug' : 'silent',
      add: (app, middleware) => {
        middleware.webpack();
        middleware.content();
      },
    });
    if (server) {
      server.on('listening', ({options: opts}) => {
        //@ts-ignore - types for webpack-serve don't allow `opts.protocol`
        reporter.log({
          type: 'info',
          text: `Started server on ${opts.protocol}://${opts.host}:${opts.port}/`
        })
      });
    }
  };

  const stopCompiling = async () => {
    if (server) {
      server.close();
    }
  };

  return run({
    reporter,
    createCompiler,
    startCompiling,
    stopCompiling
  });
}
