
import * as path from 'path';
import { MatchFilter, MatchFilterArray, list, match, watch, ListOptions } from '@tradie/file-utils';
import Reporter, {Message} from '@tradie/reporter-utils';
import CancelablePromise from '@jameslnewell/cancelable-promise';

export type Filter = MatchFilter;

export type Task =(file: string) => void | Message[] | Promise<void | Message[]>;

export interface Group {
  include?: Filter;
  exclude?: Filter;
  changed?: Task[];
  removed?: Task[];
};

export interface Options {
  reporter: Reporter;
  isWatching?: boolean;
};

// const flatten = (arrays: Filter[]): MatchFilterArray => ([] as MatchFilterArray).concat(...arrays);

export default function(
  cwd: string,
  groups: Group[],
  options: Options
) {
  const { reporter, isWatching: isWatching = false } = options;

  const runTasks = (type: 'changed' | 'removed') => async (file: string) => {
    const fullFilePath = path.resolve(cwd, file);
    await Promise.all(
      groups.map(async (group) => {
        const { include, exclude } = group;

        // get the tasks
        const tasks = group[type];

        // check there are some tasks to run
        if (!tasks || !tasks.length) {
          return;
        }

        // make sure the filters matches
        const filter = match({ context: cwd, include, exclude }); // TODO: cache filters
        if (filter(fullFilePath)) {
          reporter.started();
          try {
            // run all the tasks and flatten the messages into a flat array of messages
            const results = await Promise.all(tasks.map(task => task(fullFilePath)));
            results.forEach((nestMsgs: void | Message[]) => {
              if (nestMsgs) {
                reporter.log(nestMsgs);
              }
            });
          } catch (error) {
            reporter.failed(error);
          }
          reporter.finished();
        }
      })
    );
  };

  const onChange = runTasks('changed');
  const onRemove = runTasks('removed');

  // list included files
  const listing = list(cwd, {
    // include: flatten(groups.map(group => group.include || []))
  }).then(files => Promise.all(files.map(onChange)));

  // watch included files
  let watching: CancelablePromise<void>;
  if (isWatching) {
    watching = watch(cwd, {
      // include: flatten(groups.map(group => group.include || [])),
      created: onChange,
      updated: onChange,
      deleted: onRemove
    });
  } else {
    watching = CancelablePromise.resolve();
  }

  // wait for processing to complete
  return CancelablePromise.all([listing, watching]);
}
