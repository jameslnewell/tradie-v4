
import * as path from 'path';
import {Argv, Arguments} from 'yargs';
import { rm } from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import {handleError} from '@tradie/cli-utils'
import {getPaths} from '../config/getPaths';

export const command = 'clean';
export const describe = 'Remove generated files and folders';
export const builder = (yargs: Argv) => yargs.strict();
export const handler = handleError(async () => {
  const cwd = process.cwd();
  const paths = getPaths({cwd});

  const reporter = new Reporter({
    context: cwd,
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.started();
  try {
    await rm([
      path.join(cwd, paths.SOURCES_DEST),
      path.join(cwd, paths.COVERAGE_DEST)
    ]);
    reporter.finished();
  } catch (error) {
    reporter.failed(error);
  }
  return reporter.wait();
});
