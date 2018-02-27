import path from 'path';
import chokidar from 'chokidar';
import {match, type Filter} from './match';
import CancellablePromise from './CancellablePromise';

export type WatchOptions = {
  include?: Filter,
  exclude?: Filter,
  created?: (file: string) => void,
  updated?: (file: string) => void,
  deleted?: (file: string) => void
};

const noop = () => {};

export function watch(dir: string, options: WatchOptions = {}) {
  const {include, exclude, created = noop, updated = noop, deleted = noop} = options;

  const filter = match({
    context: dir,
    include,
    exclude
  });

  const watcher = chokidar.watch(dir, {
    cwd: dir,
    ignoreInitial: true,
    disableGlobbing: true
    //TODO: use ignore to speed things up
  });

  watcher.on('add', file => {
    if (filter(file)) {
      created(path.resolve(dir, file));
    }
  });

  watcher.on('change', file => {
    if (filter(file)) {
      updated(path.resolve(dir, file));
    }
  });

  watcher.on('unlink', file => {
    if (filter(file)) {
      deleted(path.resolve(dir, file));
    }
  });

  return new CancellablePromise((resolve, reject, onCancel) => {
    onCancel(() => {
      watcher.close();
      resolve();
    });
  });
}
