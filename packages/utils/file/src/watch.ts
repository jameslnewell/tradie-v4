import * as path from 'path';
import * as chokidar from 'chokidar';
import { match, MatchFilter } from './match';
import CancelablePromise from '@jameslnewell/cancelable-promise';

export interface WatchOptions {
  include?: MatchFilter;
  exclude?: MatchFilter;
  created?: (file: string) => void;
  updated?: (file: string) => void;
  deleted?: (file: string) => void;
};

const noop = () => {/* do nothing */ };

export function watch(dir: string, options: WatchOptions = {}): CancelablePromise<void> {
  const { include, exclude, created = noop, updated = noop, deleted = noop } = options;

  const filter = match({
    context: dir,
    include,
    exclude
  });

  const watcher = chokidar.watch(dir, {
    cwd: dir,
    ignoreInitial: true,
    disableGlobbing: true
    // TODO: use ignore to speed things up
  });

  watcher.on('add', (file: string) => {
    if (filter(file)) {
      created(path.resolve(dir, file));
    }
  });

  watcher.on('change', (file: string) => {
    if (filter(file)) {
      updated(path.resolve(dir, file));
    }
  });

  watcher.on('unlink', (file: string) => {
    if (filter(file)) {
      deleted(path.resolve(dir, file));
    }
  });

  return new CancelablePromise((resolve) => {
    return () => {
      watcher.close();
      resolve();
    };
  });
}
