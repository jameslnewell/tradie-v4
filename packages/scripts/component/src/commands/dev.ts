import {Arguments} from 'yargs';
import {getProjectInfo} from '@tradie/yarn-utils';
import Reporter from '@tradie/reporter-utils';
import {serve} from '@tradie/webpack-utils';
import {dev} from '@tradie/component-config';

const printError = (fn: (argv: Arguments) => Promise<void>) => (argv: Arguments) => Promise.resolve(fn(argv)).catch(error => {
  /* tslint:disable-next-line */
  console.error(error);
  process.exit(1);
})

export const command = 'dev'
export const desc = 'Run the dev server.'
export const builder = {}
export const handler = printError(async (argv: Arguments) => {
  const {root} = await getProjectInfo();

  const config = dev(root.path);

  const reporter = new Reporter({
    context: root.path,
    startedText: 'Building',
    finishedText: 'Built'
  });

  serve({
    config: config.webpack,
    reporter
  });

  // reject with an error when any errors were reported
  await reporter.wait();
})
