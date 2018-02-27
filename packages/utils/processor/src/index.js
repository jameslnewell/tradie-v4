// @flow
import path from 'path';
import {type Filter, list, match, watch} from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import CancellablePromise from './CancellablePromise';

export type ProcessOptions = {
  reporter: Reporter,
  watch?: boolean
};

export type ProcessGroup = {
  include?: Filter,
  exclude?: Filter,
  process?: (file: string) => void | Promise<void>,
  delete?: (file: string) => void | Promise<void>
};

const flatten = arrays => [].concat(...arrays);

export function process(
  directory: string,
  groups: ProcessGroup[] = [],
  options: ProcessOptions = {}
) {
  const {reporter, watch: isWatching = false} = options;

  // called for each file being created or updated
  async function onStartProcessing(file) {
    const fullFilePath = path.resolve(directory, file);
    await Promise.all(
      groups.map(async function(group) {
        const {process: processFn, include, exclude} = group;
        if (!processFn) {
          return;
        }
        const filter = match({context: directory, include, exclude}); //TODO: cache filters
        if (filter(fullFilePath)) {
          reporter.start();
          try {
            await processFn(fullFilePath);
          } catch (error) {
            reporter.error({
              file,
              message: error.message
            });
          }
          reporter.finish();
        }
      })
    );
  }

  // called for each file being deleted
  async function onStartDeleting(file) {
    await Promise.all(
      groups.map(async function(group) {
        const {delete: deleteFn, include, exclude} = group;
        if (!deleteFn) {
          return;
        }
        const filter = match({context: directory, include, exclude}); //TODO: cache filters
        if (filter(file)) {
          reporter.start();
          try {
            await deleteFn(file);
          } catch (error) {
            reporter.error({
              file,
              message: error.message
            });
          }
          reporter.finish();
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
      watching = Promise.resolve();
    }

    // wait for processing to complete
    Promise.all([listing, watching]).then(resolve, reject);

    // stop processing files when they change
    onCancel(() => watching.cancel());
  });
}
