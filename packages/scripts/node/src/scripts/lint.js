import linter from '@tradie/eslint-utils';
import Flow from '@tradie/flow-utils';
import {process as processFiles} from '@tradie/processor-utils';
import Reporter from '@tradie/reporter-utils';

import * as paths from '../config/paths';
import * as globs from '../config/globs';
import * as eslint from '../config/eslint';

export const command = 'lint';
export const description = 'Lint source and test files';
export const builder = {
  watch: {
    default: false,
    boolean: true,
    description: 'watch source files and re-lint them when they change'
  }
};

export default async function(args) {
  const {watch} = args;
  const debug = true;

  const lintSourceFile = linter(eslint.sources());
  const lintTestFile = linter(eslint.tests());

  const reporter = new Reporter({
    context: paths.ROOT,
    startedText: 'Linting',
    finishedText: 'Linted'
  });

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

  const processing = processFiles(
    paths.ROOT,
    [
      // lint source files
      {
        include: [globs.SOURCES],
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          const {errors, warnings} = await lintSourceFile(file);
          errors.forEach(error => reporter.error(error));
          warnings.forEach(warning => reporter.warning(warning));
        }
      },

      // lint test files
      {
        include: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          const {errors, warnings} = await lintTestFile(file);
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

  // wait for processing to finish or be cancelled
  await processing;

  // reject with an error when any errors were reported
  await reporter.wait();
}
