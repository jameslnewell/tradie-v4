import path from 'path';
import {match, type Filter} from './match';
import {list} from './list';
import {watch} from './watch';
import CancellablePromise from './CancellablePromise';

export type ProcessOptions = {
  watch?: boolean
};

export type ProcessGroup = {
  include?: Filter,
  exclude?: Filter,
  process?: (file: string) => void | Promise<void>,
  delete?: (file: string) => void | Promise<void>
};

const flatten = arrays => [].concat(...arrays);

export function process( //TODO: even emitter more appropiate??
  directory: string,
  groups: ProcessGroup[] = [],
  options: ProcessOptions = {}
) {
  const {watch: isWatching = false} = options;

  // called for each file being created or updated
  async function onStartProcessing(file) {
    // eslint-disable-line func-style
    const fullFilePath = path.resolve(directory, file);
    await Promise.all(
      groups.map(async function(group) {
        const {process: processFn, include, exclude} = group;
        const filter = match({context: directory, include, exclude}); //TODO: cache filters
        if (processFn && filter(fullFilePath)) {
          await processFn(fullFilePath);
        }
      })
    );
  }

  // called for each file being deleted
  async function onStartDeleting(file) {
    // eslint-disable-line func-style
    await Promise.all(
      groups.map(async function(group) {
        const {delete: deleteFn, include, exclude} = group;
        const filter = match({context: directory, include, exclude}); //TODO: cache filters
        if (deleteFn && filter(file)) {
          await deleteFn(file);
        }
      })
    );
  }

  return new CancellablePromise((resolve, reject, onCancel) => {
    // list included files
    const listing = list(directory, {
      include: flatten(groups.map(group => group.include || []))
    }).then(files => Promise.all(files.map(onStartProcessing)));

    // watch included files
    let watching;
    if (isWatching) {
      watching = watch(directory, {
        include: flatten(groups.map(group => group.include || [])),
        created: onStartProcessing,
        updated: onStartProcessing,
        deleted: onStartDeleting
      });
    } else {
      watching = CancellablePromise.resolve();
    }

    // wait for processing to complete
    Promise.all([listing, watching]).then(resolve, reject);

    // stop processing files when they change
    onCancel(() => watching.cancel());
  });
}
