import webpack from 'webpack';
import createEmitter from './createEmitter';

export default function watch(config) {
  let compiler;
  let watcher;

  const createCompiler = () => {
    compiler = webpack(config);
  };

  const startCompiling = () => {
    watcher = compiler.watch({});
  };

  const stopCompiling = () => {
    if (watcher) {
      watcher.close();
    }
  };

  return createEmitter(createCompiler, startCompiling, stopCompiling);
}
