import del from 'del';
import Reporter from '@tradie/reporter-utils';

import * as paths from '../config/paths';

export default async function() {
  const reporter = new Reporter({
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.start();
  try {
    await del([paths.CODE_DEST, paths.COVERAGE_DEST]);
    reporter.finish();
  } catch (error) {
    reporter.error(error);
  }

  return reporter.wait();
}
