import { copy, rm, name } from '@tradie/file-utils';
import processFiles from '@tradie/processor-utils';
import linter from '@tradie/tslint-utils';
import transpiler from '@tradie/typescript-utils';
import babel from '@tradie/babel-utils';
import Reporter from '@tradie/reporter-utils';

import * as paths from '../config/paths';
import * as globs from '../config/globs';
import babelOptions from '../config/babelOptions';
import * as tslintConfig from '../config/tslintConfig';
import * as typescriptConfig from '../../tsconfig.json';

export default async function (args: { watch: boolean }) {
  const { watch } = args;
  const root = process.cwd();

  const reporter = new Reporter({
    context: root,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const lint = {
    source: linter(tslintConfig.source()),
    example: linter(tslintConfig.example()),
    test: linter(tslintConfig.test())
  };

  const transpile = (file: string) => babel(file, name(file, '[folder][name].js', {
    src: paths.CODE_SRC,
    dest: paths.CODE_DEST
  }), babelOptions);

  const checkTypes = transpiler({
    ...typescriptConfig.compilerOptions,
    rootDir: root,
    noEmit: true
  });

  const extractAndCheckTypes = transpiler({
    ...typescriptConfig.compilerOptions,
    rootDir: paths.CODE_SRC,
    outDir: paths.CODE_DEST,
    declaration: true,
    emitDeclarationOnly: true
  });

  const processing = processFiles(
    root,
    [

      // include typings in the compilation
      // FIXME: this needs to be done before we check any other files
      {
        include: globs.TYPES,
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        changed: [checkTypes, extractAndCheckTypes]
      },

      // lint, transpile and check and extract types from source files
      {
        include: globs.SOURCES,
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        changed: [lint.source, transpile, extractAndCheckTypes],
        removed: [/* TODO: */]
      },

      // copy other source files
      {
        include: globs.FILES,
        exclude: [globs.SOURCES, globs.TESTS, globs.MOCKS, globs.FIXTURES, globs.EXAMPLES],
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
        changed: [lint.example, checkTypes]
      },

      // lint and check test files
      {
        include: [globs.TESTS, globs.MOCKS],
        exclude: [globs.FIXTURES],
        changed: [lint.test, checkTypes]
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
