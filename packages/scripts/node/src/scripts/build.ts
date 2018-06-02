import { copy, rm, name } from '@tradie/file-utils';
import { process as processFiles } from '@tradie/processor-utils';
import linter from '@tradie/tslint-utils';
import transpiler from '@tradie/typescript-utils';
import Reporter from '@tradie/reporter-utils';

import * as paths from '../config/paths';
import * as globs from '../config/globs';
import * as tslint from '../config/tslint';
import * as tsconfig from '../config/typescript';

export default async function (args: { watch: boolean }) {
  const { watch } = args;

  const lint = {
    source: linter(tslint.source()),
    example: linter(tslint.example()),
    test: linter(tslint.test())
  };

  const transpile = {
    source: transpiler(tsconfig.source()),
    example: transpiler({
      ...tsconfig.example(),
      noEmit: true
    }),
    test: transpiler({
      ...tsconfig.test(),
      noEmit: true
    })
  };

  const reporter = new Reporter({
    context: paths.ROOT,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const processing = processFiles(
    paths.ROOT,
    [

      // include typings in the compilation
      {
        include: [globs.TYPES],
        async process(file) {
          await Promise.all([
            transpile.source(file).then(messages => reporter.log(messages))
          ]);
        }
      },

      // lint, transpile and extract types from source files
      {
        include: [...globs.SOURCES],
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        async process(file) {
          await Promise.all([
            lint.source(file).then(messages => reporter.log(messages)),
            transpile.source(file).then(messages => reporter.log(messages))
          ]);
        },
        async delete() {
          await Promise.all([
            // TODO:
          ]);
        }
      },

      // copy other source files
      {
        include: globs.FILES,
        exclude: [...globs.SOURCES, globs.TESTS, globs.MOCKS, globs.FIXTURES, globs.EXAMPLES],
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
      },

      // lint example files
      {
        include: [globs.EXAMPLES],
        async process(file) {
          await Promise.all([
            lint.example(file).then(messages => reporter.log(messages)),
            transpile.example(file).then(messages => reporter.log(messages))
          ]);
        }
      },

      // lint test files
      {
        include: [globs.TESTS, globs.MOCKS],
        exclude: [globs.FIXTURES],
        async process(file) {
          await Promise.all([
            lint.test(file).then(messages => reporter.log(messages)),
            transpile.test(file).then(messages => reporter.log(messages))
          ]);
        }
      }

    ],
    { watch, reporter }
  );

  process.on('SIGINT', () => {
    processing.cancel();
    reporter.stopping();
  });

  // wait for processing to finish or be cancelled
  await processing;

  // reject with an error when any errors were reported
  await reporter.wait();
}
