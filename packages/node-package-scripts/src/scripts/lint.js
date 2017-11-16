import {process as processFiles} from '@tradie/file-utils';
import linter from '@tradie/eslint-utils';
import Flow from '@tradie/flow-utils';
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
    console.log('before:finished');
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
          reporter.start();
          try {
            const {errors, warnings} = await lintSourceFile(file);
            errors.forEach(error => reporter.error(error));
            warnings.forEach(warning => reporter.warning(warning));
          } catch (error) {
            reporter.error({
              file: error.file || file,
              message: debug ? error.stack || error.message : error.message
            });
          }
          reporter.finish();
        }
      },

      // lint test files
      {
        include: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          reporter.start();
          try {
            const {errors, warnings} = await lintTestFile(file);
            errors.forEach(error => reporter.error(error));
            warnings.forEach(warning => reporter.warning(warning));
          } catch (error) {
            reporter.error({
              file: error.file || file,
              message: debug ? error.stack || error.message : error.message
            });
          }
          reporter.finish();
        }
      }
    ],
    {watch}
  );

  process.on('SIGINT', () => {
    processing.cancel();
    reporter.stop();
  });

  // wait for processing to start
  await processing;
  await reporter.wait();
}