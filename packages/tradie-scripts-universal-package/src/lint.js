// @flow
import Files from 'tradie-utils-file';
import Reporter from 'tradie-utils-reporter';
import ESLint from 'tradie-utils-eslint';
import Flow from 'tradie-utils-flow';
import FileProcessor from 'tradie-utils-processor';

export interface Options {
  root: string,
  watch: boolean,
  eslint: Object,
  flow: Object
}

export default async function(options: Options) {
  const {root, watch, eslint: eslintGroups, flow: flowGroups} = options;

  const files = new Files({
    directory: root,
    watch,
    include: []
      .concat(eslintGroups)
      .reduce(
        (includes, eslintGroup) => includes.concat(eslintGroup.include),
        []
      )
    // exclude: //TODO:
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
      eslint.lint(file).then(
        result => {
          result.errors.forEach(error => reporter.error(error));
          result.warnings.forEach(warning => reporter.warn(warning));
        },
        error => {
          reporter.errored(error);
        }
      ),

    onFinished: () =>
      flow.check().then(
        result => {
          result.errors.forEach(error => reporter.error(error));
          result.warnings.forEach(warning => reporter.warn(warning));
        },
        error => {
          reporter.errored(error);
        }
      )
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  await processor.run();
}
