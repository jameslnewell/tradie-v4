const path = require('path');

const chalk = require('chalk');
const Files = require('tradie-utils-file');
const Linter = require('tradie-utils-eslint').Linter;
const Transpiler = require('tradie-utils-babel');
const TypeChecker = require('tradie-utils-flow');
const Reporter = require('tradie-utils-reporter').default;

module.exports = function(options) {
  const root = options.root;
  const src = options.src;
  const dest = options.dest;
  const include = options.include;
  const exclude = options.exclude;
  const babel = options.babel;
  const eslint = options.eslint;
  const watch = options.watch;

  files = new Files(src, {
    watch: watch,
    include: include,
    exclude: exclude
  });

  linter = new Linter(src, eslint);
  transpiler = new Transpiler(src, dest, babel);
  typechecker = new TypeChecker(root, src);
  reporter = new Reporter({watching: watch});

  const buildFile = file => {
    return Promise.all([
      linter.lint(file).then(result => {
        if (result.error) {
          reporter.error(file, result.error); //TODO: prioritise less than transpiler error
        }
        //TODO: warnings
      }),

      transpiler.transpile(file).catch(error => reporter.error(file, error))
    ]);
  };

  const deleteFile = file => {
    return del(transpiler.destFile(file)).catch(error =>
      reporter.error(file, error)
    );
  };

  const checkAllFiles = () => {
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
        Object.keys(flatErrorsByFile).forEach(file =>
          reporter.error(file, flatErrorsByFile[file].join('\n'))
        );
      })
      .catch(error => reporter.fatalError(error));
  };

  //run the initial build
  reporter.started();
  files
    .list()
    .then(list => Promise.all(list.map(file => buildFile(file))))
    .then(() => reporter.finished(), error => reporter.fatalError(error));

  if (watch) {
    files.on('add', file => {
      reporter.started();
      buildFile(file).then(() => reporter.finished());
    });

    files.on('change', file => {
      reporter.started();
      buildFile(file).then(() => reporter.finished());
    });

    files.on('unlink', file => {
      reporter.started();
      deleteFile(file).then(() => reporter.finished());
    });
  }

  process.on('SIGINT', () => {
    reporter.stop();
  });

  return reporter.wait();
};
