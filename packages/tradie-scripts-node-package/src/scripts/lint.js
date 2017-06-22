import Linter from 'tradie-utils-eslint';
import TypeChecker from 'tradie-utils-flow';
import Processor from 'tradie-utils-processor';

export default function(options) {
  const {root, src, dest, include, exclude, eslint, watch} = options;

  const linter = new Linter(src, eslint);
  const typechecker = new TypeChecker(root, src, dest);

  const processFile = (file, report) =>
    linter
      .lint(file)
      .then(result => {
        if (result.error) report.error(file, result.error);
        if (result.warning) report.warning(file, result.warning);
      })
      .then(() => {
        if (report.hasErrors()) {
          return Promise.resolve();
        }

        return typechecker.check().then(result => {
          result.errors
            .filter(error => error.file === file)
            .forEach(error => report.error(file, error.message));
          result.warnings
            .filter(warning => warning.file === file)
            .forEach(warning => report.error(file, warning.message));
        });
      });

  const processFiles = (files, report) =>
    Promise.all(
      files.map(file =>
        linter.lint(file).then(result => {
          if (result.error) report.error(file, result.error);
          if (result.warning) report.warning(file, result.warning);
        })
      )
    )
      .then(() => typechecker.check())
      .then(result => {
        result.errors.forEach(error => report.error(error.file, error.message));
        result.warnings.forEach(warning =>
          report.warning(warning.file, warning.warning)
        );
      });

  const processor = new Processor({
    directory: src,

    watch,
    include,
    exclude,

    processFile,
    processFiles,

    startedText: 'Linting',
    finishedText: 'Linted'
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  return processor.run();
}
