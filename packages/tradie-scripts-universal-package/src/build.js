import wp from 'webpack';
import {rollup} from 'rollup';
import Files from 'tradie-utils-file';
import Linter from 'tradie-utils-eslint';
import Transpiler from 'tradie-utils-babel';
import TypeChecker from 'tradie-utils-flow';
import Reporter from 'tradie-utils-reporter';

function runRollup(rollupOptions) {
  rollupOptions = [].concat(rollupOptions);
  return Promise.all(
    rollupOptions.map(options =>
      rollup(options).then(bundle =>
        Promise.all(options.targets.map(target => bundle.write(target)))
      )
    )
  ); //TODO: report errors
}

export default async function(options) {
  const {root, eslint, babel, rollup, webpack} = options;

  const linter = new Linter(root, eslint);
  const transpiler = new Transpiler(root, babel);
  const typechecker = new TypeChecker(root);

  const reporter = new Reporter({
    directory: root,
    startedText: 'Building',
    finishedText: 'Built'
  });

  function lint(file) {
    return linter.lint(file).then(result => {
      if (result.error) reporter.error(file, result.error);
      if (result.warning) reporter.warning(file, result.warning);
    });
  }

  function transpile(file) {
    return transpiler
      .transpile(file)
      .catch(error => reporter.error(file, error));
  }

  function exportTypes(file) {
    return typechecker.export(file).catch(error => reporter.error(file, error));
  }

  function bundle() {
    return runRollup(rollup).catch(error => reporter.errored(error)); //TODO: report errors for individual files
  }

  function checkTypes() {
    return typechecker.check().then(result => {
      result.errors.forEach(error => reporter.error(error.file, error.message));
      result.warnings.forEach(warning =>
        reporter.error(warning.file, warning.message)
      );
    });
  }

  //TODO: create webpack bundle+html for demo
  function demo() {
    return new Promise((resolve, reject) => {
      if (!webpack) {
        resolve();
        return;
      }

      wp(webpack, (error, stats) => {
        if (error) {
          reject(error);
          return;
        }

        if (stats.hasErrors()) {
          console.log(stats.toJson().errors);
        }

        if (stats.hasWarnings()) {
          console.log(stats.toJson().warnings);
        }

        resolve();
      });
    });
  }

  function processFile(file) {
    return Promise.all([lint(file), transpile(file), exportTypes(file)]);
  }

  function processFiles() {
    const files = new Files(
      root,
      {
        include: 'src/**'
      } /* FIXME: {include, exclude} - merge from babel and eslint groups */
    );
    return Promise.all([
      files.list().then(list => Promise.all(list.map(processFile))),
      bundle(),
      demo(),
      checkTypes()
    ]);
  }

  reporter.started();
  processFiles().then(
    () => reporter.finished(),
    error => reporter.errored(error)
  );

  await reporter.wait();
}
