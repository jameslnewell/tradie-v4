import Files from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import ESLint from '@tradie/eslint-utils';
import Flow from '@tradie/flow-utils';
import FileProcessor from '@tradie/file-processor-utils';

export default function(options) {
  const {root, watch, eslint: eslintGroups, flow: flowGroups} = options;

  const files = new Files({
    directory: root,
    watch,
    include: [
      ...[]
        .concat(eslintGroups)
        .reduce(
          (includes, eslintGroup) => includes.concat(eslintGroup.include),
          []
        ) //TODO: create a fn that does this
    ]
    /* FIXME: {exclude} - merge from flow and eslint groups */
  });

  const reporter = new Reporter({
    directory: root,
    watch,
    startedText: 'Linting',
    finishedText: 'Linted'
  });

  const eslint = new ESLint(root, eslintGroups);
  const flow = new Flow(root, flowGroups);

  const processor = new FileProcessor({
    files,
    reporter,

    onChange: file =>
      eslint.lint(file).then(result => {
        result.errors.forEach(error => reporter.error(error));
        result.warnings.forEach(warning => reporter.warn(warning));
      }),

    onFinished: () =>
      flow.check().then(result => {
        result.errors.forEach(error => reporter.error(error));
        result.warnings.forEach(warning => reporter.warn(warning));
      })
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  return processor.run();
}
