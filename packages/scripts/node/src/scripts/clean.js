import {rm} from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';

import * as paths from '../config/paths';

export default async function() {
  const reporter = new Reporter({
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.start();
  try {
    await rm([paths.CODE_DEST, paths.COVERAGE_DEST]);
    reporter.finish();
  } catch (error) {
    reporter.error(error);
  }

  return reporter.wait();
}
