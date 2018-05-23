
import * as path from 'path';
import { MatchFilter, MatchFilterArray, list, match, watch, ListOptions } from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import CancelablePromise from '@jameslnewell/cancelable-promise';

export interface ProcessOptions {
  reporter: Reporter;
  watch?: boolean;
};

export interface ProcessGroup {
  include?: MatchFilter;
  exclude?: MatchFilter;
  process?: (file: string) => void | Promise<void>;
  delete?: (file: string) => void | Promise<void>;
};

const flatten = (arrays: MatchFilter[]): MatchFilterArray => ([] as MatchFilterArray).concat(...arrays);

export function process(
  directory: string,
  groups: ProcessGroup[],
  options: ProcessOptions
) {
  const { reporter, watch: isWatching = false } = options;

  // called for each file being created or updated
  async function onStartProcessing(file: string) {
    const fullFilePath = path.resolve(directory, file);
    await Promise.all(
      groups.map(async (group) => {
        const { process: processFn, include, exclude } = group;
        if (!processFn) {
          return;
        }
        const filter = match({ context: directory, include, exclude }); // TODO: cache filters
        if (filter(fullFilePath)) {
          reporter.start();
          try {
            await processFn(fullFilePath);
          } catch (error) {
            reporter.report({
              type: 'error',
              file,
              text: error.message,
              trace: error.stack
            });
          }
          reporter.finish();
        }
      })
    );
  }

  // called for each file being deleted
  async function onStartDeleting(file: string) {
    await Promise.all(
      groups.map(async (group) => {
        const { delete: deleteFn, include, exclude } = group;
        if (!deleteFn) {
          return;
        }
        const filter = match({ context: directory, include, exclude }); // TODO: cache filters
        if (filter(file)) {
          reporter.start();
          try {
            await deleteFn(file);
          } catch (error) {
            reporter.report({
              type: 'error',
              file,
              text: error.message,
              trace: error.stack
            });
          }
          reporter.finish();
        }
      })
    );
  }

  // list included files
  const listing = list(directory, {
    include: flatten(groups.map(group => group.include || []))
  }).then(files => Promise.all(files.map(onStartProcessing)));

  // watch included files
  let watching: CancelablePromise<void>;
  if (isWatching) {
    watching = watch(directory, {
      include: flatten(groups.map(group => group.include || [])),
      created: onStartProcessing,
      updated: onStartProcessing,
      deleted: onStartDeleting
    });
  } else {
    watching = CancelablePromise.resolve();
  }

  // wait for processing to complete
  return CancelablePromise.all([listing, watching]);
}
