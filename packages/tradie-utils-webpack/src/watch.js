import {EventEmitter} from 'events';
import webpack from 'webpack';
import emit from './emit';

export default function watch(config) {
  const emitter = new EventEmitter();

  if (!config) {
    return emitter;
  }

  const compiler = webpack(config);

  emit(emitter, compiler);

  const watcher = compiler.watch({});

  emitter.close = () => watcher.close();

  return emitter;
}
