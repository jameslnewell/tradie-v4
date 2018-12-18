import {Argv, Arguments} from 'yargs';
import { copy, rm, name } from '@tradie/file-utils';
import processFiles from '@tradie/processor-utils';
import babel from '@tradie/babel-utils';
import tslint from '@tradie/tslint-utils';
import typescript from '@tradie/typescript-utils';
import Reporter from '@tradie/reporter-utils';
import {handleError} from '@tradie/cli-utils'
import { getPaths } from '../config/getPaths';
import { getGlobs } from '../config/getGlobs';
import { getTSLintConfig } from '../config/getTSLintConfig';
import { getTSConfig } from '../config/getTSConfig';
import { getBabelOptions } from '../config/getBabelOptions';

export const command = 'build'

export const describe = 'Lint and transpile.'

export const builder = (yargs: Argv) => yargs.strict().option('watch', {
  default: false,
  boolean: true,
  description: 'watch sources and re-transpile them when they change'
});

export const handler = handleError(async (argv: Arguments) => {
  const { watch } = argv;
  const cwd = process.cwd();
  const paths = getPaths({cwd});
  const globs = getGlobs();
  const babelOptions = getBabelOptions();
  const tslintConfig = getTSLintConfig({cwd});
  const tsconfig = getTSConfig({cwd});


  const reporter = new Reporter({
    context: cwd,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const lint = {
    sources: tslint(tslintConfig.sources),
    examples: tslint(tslintConfig.examples),
    tests: tslint(tslintConfig.tests)
  };

  const check = {
    sources: typescript(tsconfig.sources),
    examples: typescript(tsconfig.examples),
    tests: typescript(tsconfig.tests),
  };

  const transpile = (file: string) => babel(file, name(file, '[folder][name].js', {
    src: paths.SOURCES_SRC,
    dest: paths.SOURCES_DEST
  }), babelOptions.sources);


  const processing = processFiles(
    cwd,
    [

      // include typings in the compilation
      // FIXME: this needs to be done before we check any other files
      {
        include: globs.TYPES,
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        changed: [check.sources, check.examples, check.tests]
      },

      // lint, transpile and check and extract types from source files
      {
        include: globs.SOURCES,
        exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
        changed: [lint.sources, check.sources, transpile],
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
              src: paths.SOURCES_SRC,
              dest: paths.SOURCES_DEST
            })
          )
        ],
        removed: [
          (file: string) => rm(
            name(file, '[folder][name][ext]', {
              src: paths.SOURCES_SRC,
              dest: paths.SOURCES_DEST
            })
          )
        ]
      },

      // lint and check example files
      {
        include: [globs.EXAMPLES],
        changed: [lint.examples, check.examples]
      },

      // lint and check test files
      {
        include: [globs.TESTS, globs.MOCKS],
        exclude: [globs.FIXTURES],
        changed: [lint.tests, check.tests]
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

});
