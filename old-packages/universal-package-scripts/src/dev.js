//@flow
import Reporter from '@tradie/reporter-utils';
import {serve} from '@tradie/webpack-utils';

export interface Options {
  root: string,
  webpack: Object
}

export default async function(options: Options) {
  const {root, webpack} = options;

  const reporter = new Reporter({
    watch: true,
    directory: root,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const server = serve(webpack)
    .on('started', () => reporter.started())
    .on('finished', () => reporter.finished())
    .on('stopping', () => reporter.stopping())
    .on('log', log => reporter.log(log))
    .on('error', error => reporter.errored(error));

  process.on('SIGINT', () => {
    server.close();
  });

  return reporter.wait();
}
