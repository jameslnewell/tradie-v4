
import * as path from 'path';
import { rm } from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import * as paths from '../config/paths';

export default async function () {
  const root = process.cwd();

  const reporter = new Reporter({
    context: root,
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.started();
  try {
    await rm([
      path.join(root, paths.CODE_DEST),
      path.join(root, paths.COVERAGE_DEST)
    ]);
    reporter.finished();
  } catch (error) {
    reporter.failed(error);
  }
  return reporter.wait();
}
