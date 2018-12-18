import * as path from 'path';
import {Arguments} from 'yargs';
import * as resolvePlugin from 'rollup-plugin-node-resolve';
import * as replacePlugin from 'rollup-plugin-replace';
import * as commonjsPlugin from 'rollup-plugin-commonjs';
import * as babelPlugin from 'rollup-plugin-babel';
import { copy, rm, name } from '@tradie/file-utils';
import processFiles from '@tradie/processor-utils';
import linter from '@tradie/tslint-utils';
import typechecker from '@tradie/typescript-utils';
import babel from '@tradie/babel-utils';
import Reporter from '@tradie/reporter-utils';
import rollup from '@tradie/rollup-utils';
import {printError} from '../utils/printError';
import { getPaths } from '../config/getPaths';
import { getGlobs } from '../config/getGlobs';
import { getBabelOptions } from '../config/getBabelOptions';
import { getTSLintConfig } from '../config/getTSLintConfig';
import { getTSConfig } from '../config/getTSConfig';
import * as manifest from '../../package.json';

export const command = 'build'
export const desc = 'Build the component artifacts.'
export const builder = {}
export const handler = printError(async (argv: Arguments) => {
  const cwd = process.cwd();
  const paths = getPaths({cwd});
  const globs = getGlobs();
  const babelOptions = getBabelOptions();
  const tslintConfig = getTSLintConfig({cwd});
  const typescriptConfig = getTSConfig({cwd});

  const reporter = new Reporter({
    context: cwd,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const lint = {
    source: linter(tslintConfig.sources),
    test: linter(tslintConfig.tests)
  };

  const cjs = (file: string) => babel(file, name(file, '[folder]/cjs/[name].js', {
    src: paths.SOURCES_SRC,
    dest: paths.SOURCES_DEST
  }), babelOptions.cjs);

  const esm = (file: string) => babel(file, name(file, '[folder]/esm/[name].js', {
    src: paths.SOURCES_SRC,
    dest: paths.SOURCES_DEST
  }), babelOptions.esm);

  const checkTypes = typechecker({
    ...typescriptConfig.tests.compilerOptions,
    rootDir: cwd,
    noEmit: true
  });

  const extractAndCheckTypes = typechecker({
    ...typescriptConfig.sources.compilerOptions,
    rootDir: paths.SOURCES_SRC,
    outDir: path.join(paths.SOURCES_DEST, 'types'),
    declaration: true,
    emitDeclarationOnly: true
  });

  const bundling = rollup({
    watch: argv.watch,
    reporter,
    input: {
      input: 'src/index.tsx',
      external: ['react'],
      plugins: [
        replacePlugin({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        babelPlugin({
          ...manifest.name,
          extensions: ['.tsx', '.ts'],
          include: 'src/**/*',
          exclude: 'node_modules/**'
        }),
        resolvePlugin(),
        commonjsPlugin({
          include: /node_modules/
        }),
      ]
    },
    output: {
      file: path.join(paths.SOURCES_DEST, 'umd.js'),
      format: 'umd',
      name: manifest.name
    },
  } as any);

  const processing = processFiles(
    cwd,
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
        include: [globs.TESTS, globs.MOCKS],
        exclude: [globs.FIXTURES],
        changed: [lint.test, checkTypes]
      }

    ],
    { reporter, isWatching: argv.watch}
  );

  process.on('SIGINT', () => {
    bundling.cancel();
    processing.cancel();
    reporter.stopping();
  });

  // wait for processing to finish or be cancelled
  await Promise.all([bundling, processing]);

  // reject with an error when any errors were reported
  await reporter.wait();

});
