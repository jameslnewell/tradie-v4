//@flow
import Reporter from '@tradie/reporter-utils';
import {process as processFiles} from '@tradie/processor-utils';
import linter from '@tradie/eslint-utils';
import Flow from '@tradie/flow-utils';
import * as paths from '../config/paths';
import * as globs from '../config/globs';
import * as eslint from '../config/eslint';

const debug = process.env.CI || false;

export default async function(argv: {watch: boolean}) {
  const {watch} = argv;

  const reporter = new Reporter({
    watch: false,
    directory: paths.ROOT,
    startedText: 'Linting',
    finishedText: 'Lint'
  });

  const lintSourceFile = linter(eslint.source());
  const lintExampleFile = linter(eslint.example());
  const flow = new Flow(paths.ROOT);

  reporter.before('finished', async function() {
    try {
      const result = await flow.status(); //TODO: exclude files not processed
      result.errors.forEach(error => reporter.error(error));
      result.warnings.forEach(warning => reporter.warning(warning));
    } catch (error) {
      reporter.error({
        file: error.file,
        message: debug ? error.stack || error.message : error.message
      });
    }
  });

  // lint the sources, transpile the sources and export the typings
  const processing = processFiles(
    paths.ROOT,
    [
      {
        include: globs.SOURCES,
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          const {errors, warnings} = await lintSourceFile(file);
          errors.forEach(error => reporter.error(error));
          warnings.forEach(warning => reporter.warning(warning));
        }
      },
      {
        include: globs.EXAMPLE,
        async process(file) {
          const {errors, warnings} = await lintExampleFile(file);
          errors.forEach(error => reporter.error(error));
          warnings.forEach(warning => reporter.warning(warning));
        }
      }
    ],
    {watch, reporter}
  );

  process.on('SIGINT', () => {
    processing.cancel();
    reporter.stop();
  });

  await processing;
  await reporter.wait();
}
