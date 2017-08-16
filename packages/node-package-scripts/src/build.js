import del from 'del';
import Files from '@tradie/file-utils';
import Reporter from '@tradie/reporter-utils';
import ESLint from '@tradie/eslint-utils';
import Babel from '@tradie/babel-utils';
import Flow from '@tradie/flow-utils';
import FileProcessor from '@tradie/file-processor-utils';

export default function(options) {
  const {
    root,
    watch,
    eslint: eslintGroups,
    babel: babelGroups,
    flow: flowGroups
  } = options;

  const files = new Files({
    directory: root,
    watch,
    include: [
      ...[]
        .concat(eslintGroups)
        .reduce(
          (includes, eslintGroup) => includes.concat(eslintGroup.include),
          []
        ),
      ...[]
        .concat(babelGroups)
        .reduce(
          (includes, babelGroup) => includes.concat(babelGroup.include),
          []
        )
    ]
    /* FIXME: {exclude} - merge from babel and eslint groups */
  });

  const reporter = new Reporter({
    directory: root,
    watch,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const eslint = new ESLint(root, eslintGroups);
  const babel = new Babel(root, babelGroups);
  const flow = new Flow(root, flowGroups);

  const processor = new FileProcessor({
    files,
    reporter,

    onChange: file =>
      Promise.all([
        eslint.lint(file).then(result => {
          result.errors.forEach(error => reporter.error(error));
          result.warnings.forEach(warning => reporter.warn(warning));
        }),
        babel
          .transpile(file)
          .catch(error => reporter.error({file, message: error})),
        flow.export(file).catch(error => reporter.error({file, message: error}))
      ]),

    onRemove: () => del([]), //FIXME:

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
