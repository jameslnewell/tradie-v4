import Reporter from '@tradie/reporter-utils';
import {rm} from '@tradie/file-utils';
import {CODE_DEST, COVERAGE_DEST, EXAMPLE_DEST} from '../config/paths';

export default async function(options: Options) {
  const reporter = new Reporter({
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.start();
  try {
    await rm([CODE_DEST, COVERAGE_DEST, EXAMPLE_DEST]);
    reporter.finish();
  } catch (error) {
    console.log(error);
    reporter.errored(error);
  }

  return reporter.wait();
}
