import webpack from 'webpack';
import createEmitter from './createEmitter';

export default function(config) {
  const compiler = webpack(config);

  const createCompiler = () => Promise.resolve(compiler);
  const startCompiling = () => compiler.run(() => {});
  const stopCompiling = () => {};

  return createEmitter(createCompiler, startCompiling, stopCompiling);
}
