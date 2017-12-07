// @flow
import {compile} from '@tradie/webpack-utils';
import rollup from '@tradie/rollup-utils';
import Files from '@tradie/file-utils';
import ESLint from '@tradie/eslint-utils';
import Babel from '@tradie/babel-utils';
import Flow from '@tradie/flow-utils';
import Reporter from '@tradie/reporter-utils';

export interface Options {
  root: string;
  eslint: Object;
  babel: Object;
  flow: Object;
  rollup: Object;
  webpack: Object;
}

export default async function(options: Options) {
  const {
    root,
    eslint: eslintGroups,
    babel: babelGroups,
    flow: flowGroups,
    rollup: rollupConfig,
    webpack: webpackConfig
  } = options;

  const files = new Files({
    directory: root,
    include: [
      ...[]
        .concat(eslintGroups)
        .reduce((includes, eslintGroup) => includes.concat(eslintGroup.include), []),
      ...[]
        .concat(babelGroups)
        .reduce((includes, babelGroup) => includes.concat(babelGroup.include), [])
    ]
    /* FIXME: {exclude} - merge from babel and eslint groups */
  });

  const reporter = new Reporter({
    directory: root,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const eslint = new ESLint(root, eslintGroups);
  const babel = new Babel(root, babelGroups);
  const flow = new Flow(root, flowGroups);

  function bundle() {
    return rollup(rollupConfig).then(result => {
      result.errors.forEach(error => reporter.error(error));
      result.warnings.forEach(warning => reporter.warn(warning));
    });
  }

  //TODO: create webpack bundle+html for demo
  function example() {
    return compile(webpackConfig).then(result => {
      result.errors.forEach(error => reporter.error(error));
      result.warnings.forEach(warning => reporter.warn(warning));
    });
  }

  function processFile(file) {
    return Promise.all([
      //TODO: don't show all errors at once... but how if they handle reporting themselves?

      eslint.lint(file).then(result => {
        result.errors.forEach(error => reporter.error(error));
        result.warnings.forEach(warning => reporter.warn(warning));
      }),

      babel.transpile(file).catch(error => reporter.error(error)),

      flow.export(file).catch(error => reporter.error(error))
    ]);
  }

  reporter.started();
  Promise.all([
    files.list().then(list => Promise.all(list.map(processFile))),

    bundle(),

    example(),

    flow.check().then(result => {
      result.errors.forEach(error => reporter.error(error));
      result.warnings.forEach(warning => reporter.warn(warning));
    })
  ]).then(() => reporter.finished(), error => reporter.errored(error));

  await reporter.wait();
}
