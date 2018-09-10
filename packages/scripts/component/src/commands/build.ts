import * as path from 'path';
import {Arguments} from 'yargs';
import { copy, rm, name } from '@tradie/file-utils';
import {build} from '@tradie/component-preset';
import processFiles from '@tradie/processor-utils';
import linter from '@tradie/tslint-utils';
import transpiler from '@tradie/typescript-utils';
import babel from '@tradie/babel-utils';
import Reporter from '@tradie/reporter-utils';
import {printError} from '../utils/printError';

export const command = 'build'
export const desc = 'Build the component artifacts.'
export const builder = {}
export const handler = printError(async (argv: Arguments) => {
  const root = process.cwd();
  const config = build({argv, root});
  const reporter = new Reporter({
    context: root,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const lint = {
    source: linter(config.tslint.sources),
    test: linter(config.tslint.tests)
  };

  const cjs = (file: string) => babel(file, name(file, '[folder]/cjs/[name].js', {
    src: config.paths.src,
    dest: config.paths.dest
  }), config.babel.cjs);

  const esm = (file: string) => babel(file, name(file, '[folder]/esm/[name].js', {
    src: config.paths.src,
    dest: config.paths.dest
  }), config.babel.esm);

  const checkTypes = transpiler({
    ...config.tsconfig.tests.compilerOptions,
    rootDir: root,
    noEmit: true
  });

  const extractAndCheckTypes = transpiler({
    ...config.tsconfig.sources.compilerOptions,
    rootDir: config.paths.src,
    outDir: path.join(config.paths.dest, 'types'),
    declaration: true,
    emitDeclarationOnly: true
  });

  const processing = processFiles(
    root,
    [

      // include typings in the compilation
      // FIXME: this needs to be done before we check any other files
      {
        include: config.globs.TYPES,
        exclude: [config.globs.TESTS, config.globs.MOCKS, config.globs.FIXTURES],
        changed: [checkTypes, extractAndCheckTypes]
      },

      // lint, transpile and check and extract types from source files
      {
        include: config.globs.SOURCES,
        exclude: [config.globs.TESTS, config.globs.MOCKS, config.globs.FIXTURES],
        changed: [lint.source, cjs, esm, extractAndCheckTypes],
        removed: [/* TODO: */]
      },

      // copy other source files
      // {
      //   include: globs.FILES,
      //   exclude: [globs.SOURCES, globs.TESTS, globs.MOCKS, globs.FIXTURES, globs.EXAMPLES],
      //   changed: [
      //     (file: string) => copy(
      //       file,
      //       name(file, '[folder][name][ext]', {
      //         src: config.paths.src,
      //         dest: config.paths.dest
      //       })
      //     )
      //   ],
      //   removed: [
      //     (file: string) => rm(
      //       name(file, '[folder][name][ext]', {
      //         src: config.paths.src,
      //         dest: config.paths.dest
      //       })
      //     )
      //   ]
      // },

      // lint and check test files
      {
        include: [config.globs.TESTS, config.globs.MOCKS],
        exclude: [config.globs.FIXTURES],
        changed: [lint.test, checkTypes]
      }

    ],
    { reporter, isWatching: argv.watch}
  );

  process.on('SIGINT', () => {
    processing.cancel();
    reporter.stopping();
  });

  // wait for processing to finish or be cancelled
  await processing;

  // reject with an error when any errors were reported
  await reporter.wait();

});
