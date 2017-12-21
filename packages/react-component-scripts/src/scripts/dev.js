import Reporter from '@tradie/reporter-utils';
import {serve} from '@tradie/webpack-utils';
import webpack from '../config/webpack';
import {ROOT} from '../config/paths';

export default async function(options: Options) {
  const reporter = new Reporter({
    watch: true,
    directory: ROOT,
    startedText: 'Building',
    finishedText: 'Built'
  });

  // TODO: add flowtype checking and linting

  const server = serve(webpack())
    .on('started', () => reporter.start())
    .on('finished', () => reporter.finish())
    .on('stopped', () => reporter.stop())
    .on('log', log => reporter.log(log))
    .on('error', error => reporter.errored(error));

  process.on('SIGINT', () => {
    server.stop();
  });

  await reporter.wait();
}
