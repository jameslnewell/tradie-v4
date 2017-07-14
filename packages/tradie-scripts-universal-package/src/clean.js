import del from 'del';
import Reporter from 'tradie-utils-reporter';

export default function({paths}) {
  const reporter = new Reporter({
    startedText: 'Cleaning',
    finishedText: 'Cleaned'
  });

  reporter.started();
  del(paths).then(() => reporter.finished(), error => reporter.errored(error));

  return reporter.wait();
}
