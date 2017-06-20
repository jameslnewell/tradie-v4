import del from 'del';
import Files from 'tradie-utils-file';
import Linter from 'tradie-utils-eslint';
import Transpiler from 'tradie-utils-babel';
import TypeChecker from 'tradie-utils-flow';
import Reporter from 'tradie-utils-reporter';

export default function(options) {
  const {root, src, dest, include, exclude, babel, eslint, watch} = options;

  const files = new Files(src, {
    watch,
    include,
    exclude
  });

  const linter = new Linter(src, eslint);
  const transpiler = new Transpiler(src, dest, babel);
  const typechecker = new TypeChecker(root, src);
  const reporter = new Reporter({watching: watch});

  const buildFile = file =>
    Promise.all([
      linter.lint(file).then(result => {
        if (result.error) {
          reporter.error(file, result.error); //TODO: prioritise less than transpiler error
        } else if (result.warning) {
          reporter.warning(file, result.warning); //TODO: prioritise less than transpiler error
        }
      }),

      transpiler.transpile(file).catch(error => reporter.error(file, error))
    ]);

  const deleteFile = file =>
    del(transpiler.destFile(file)).catch(error => reporter.error(file, error));

  const checkFiles = () => {
    //if we already have errors to display to the user, then show them, don't make them wait any longer!
    //  - they'll need to fix them first anyway
    if (reporter.hasErrors()) {
      return Promise.resolve();
    }

    return typechecker
      .check()
      .then(errors => {
        //squash all flow errors into a single error
        const flatErrorsByFile = {};
        errors.forEach(error => {
          if (!flatErrorsByFile[error.file]) {
            flatErrorsByFile[error.file] = [];
          }
          flatErrorsByFile[error.file].push(`${error.message}`);
        });

        //add the errors
        Object.keys(flatErrorsByFile)
          .filter(file => files.include(file)) //exclude test files
          .forEach(file =>
            reporter.error(file, flatErrorsByFile[file].join('\n'))
          );
      })
      .catch(error => reporter.errored(error));
  };

  //run the initial build
  reporter.started();
  files
    .list()
    .then(list => Promise.all(list.map(file => buildFile(file))))
    .then(() => checkFiles())
    .then(() => reporter.finished(), error => reporter.errored(error));

  if (watch) {
    files.on('add', file => {
      reporter.started();
      buildFile(file).then(() => checkFiles()).then(() => reporter.finished());
    });

    files.on('change', file => {
      reporter.started();
      buildFile(file).then(() => checkFiles()).then(() => reporter.finished());
    });

    files.on('unlink', file => {
      reporter.started();
      deleteFile(file).then(() => reporter.finished());
    });
  }

  process.on('SIGINT', () => {
    files.close();
    reporter.stop();
  });

  return reporter.wait();
}
