import { copy, rm, name } from '@tradie/file-utils';
import processFiles from '@tradie/processor-utils';
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
      // FIXME: this needs to be done before we check any other files
      {
        include: [globs.TYPES],
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        changed: [transpile.source]
      },

      // lint, transpile and extract types from source files
      {
        include: [...globs.SOURCES],
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        changed: [lint.source, transpile.source],
        removed: [/* TODO: */]
      },

      // copy other source files
      {
        include: globs.FILES,
        exclude: [...globs.SOURCES, globs.TESTS, globs.MOCKS, globs.FIXTURES, globs.EXAMPLES],
        changed: [
          (file: string) => copy(
            file,
            name(file, '[folder][name][ext]', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST
            })
          )
        ],
        removed: [
          (file: string) => rm(
            name(file, '[folder][name][ext]', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST
            })
          )
        ]
      },

      // lint and check example files
      {
        include: [globs.EXAMPLES],
        changed: [lint.example, transpile.example]
      },

      // lint and check test files
      {
        include: [globs.TESTS, globs.MOCKS],
        exclude: [globs.FIXTURES],
        changed: [lint.test, transpile.test]
      }

    ],
    { reporter, isWatching: watch}
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
