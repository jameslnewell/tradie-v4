
import * as path from 'path';
import { rm } from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import {getWorkspaces} from '@tradie/yarn-utils';
import * as paths from '../config/paths';

export default async function () {
  const {root, workspaces} = await getWorkspaces(process.cwd());

  const reporter = new Reporter({
    context: root,
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.started();
  try {
    await Promise.all(workspaces.map(workspace => rm([
      path.join(workspace, paths.CODE_DEST),
      path.join(workspace, paths.COVERAGE_DEST)
    ])));
    reporter.finished();
  } catch (error) {
    reporter.failed(error);
  }

  return reporter.wait();
}
