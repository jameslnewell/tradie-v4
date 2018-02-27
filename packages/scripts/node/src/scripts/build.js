import {copy, rm, name} from '@tradie/file-utils';
import linter from '@tradie/eslint-utils';
import transpile from '@tradie/babel-utils';
import Flow from '@tradie/flow-utils';
import {process as processFiles} from '@tradie/processor-utils';
import Reporter from '@tradie/reporter-utils';

import * as paths from '../config/paths';
import * as globs from '../config/globs';
import * as babel from '../config/babel';
import * as eslint from '../config/eslint';

export default async function(args) {
  const {watch} = args;
  const debug = true;

  const lintSourceFile = linter(eslint.sources());

  const reporter = new Reporter({
    context: paths.ROOT,
    startedText: 'Building',
    finishedText: 'Built'
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
      // lint, transpile and extract types from source files
      {
        include: [globs.SOURCES],
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          const linting = lintSourceFile(file).then(({errors, warnings}) => {
            errors.forEach(error => reporter.error(error));
            warnings.forEach(warning => reporter.warning(warning));
          });

          const transpiling = transpile(
            file,
            name(file, '[folder][name].js', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST
            }),
            babel.sources({root: paths.ROOT})
          );

          const exporting = flow.export(
            file,
            name(file, '[folder][name].js.flow', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST
            })
          );

          await Promise.all([linting, transpiling, exporting]);
        },
        async delete(file) {
          await Promise.all([
            rm(
              name(file, '[folder][name].js', {
                src: paths.CODE_SRC,
                dest: paths.CODE_DEST
              })
            ),
            rm(
              name(file, '[folder][name].js.flow', {
                src: paths.CODE_SRC,
                dest: paths.CODE_DEST
              })
            )
          ]);
        }
      },
      // copy other files
      {
        include: globs.FILES,
        exclude: [globs.SOURCES, globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          await copy(
            file,
            name(file, '[folder][name][ext]', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST
            })
          );
        },
        async delete(file) {
          await rm(
            name(file, '[folder][name][ext]', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST
            })
          );
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
