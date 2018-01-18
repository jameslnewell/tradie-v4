import Reporter from '@tradie/reporter-utils';
import {compile} from '@tradie/webpack-utils';
import {rm, name, process as processFiles} from '@tradie/file-utils';
import linter from '@tradie/eslint-utils';
import transpile from '@tradie/babel-utils';
import Flow from '@tradie/flow-utils';
import * as paths from '../config/paths';
import * as globs from '../config/globs';
import * as eslint from '../config/eslint';
import * as babel from '../config/babel';
import webpack from '../config/webpack';

const debug = process.env.CI || false;

export default async function() {
  const createCJSFilename = file =>
    name(file, '[folder][name].js', {
      src: paths.CODE_SRC,
      dest: paths.CODE_DEST_CJS
    });

  const createESMFilename = file =>
    name(file, '[folder][name].js', {
      src: paths.CODE_SRC,
      dest: paths.CODE_DEST_ESM
    });

  const createTypeFilename = file =>
    name(file, '[folder][name].js.flow', {
      src: paths.CODE_SRC,
      dest: paths.CODE_DEST_CJS
    });

  const reporter = new Reporter({
    watch: true, //TODO
    directory: paths.ROOT,
    startedText: 'Building',
    finishedText: 'Built'
  });

  const lintSourceFile = linter(eslint.source());
  const lintExampleFile = linter(eslint.example());
  const flow = new Flow(paths.ROOT);

  // build the example site
  const compiler = compile(webpack({optimize: true}));
  compiler
    .on('started', () => reporter.start())
    .on('finished', () => reporter.finish())
    .on('log', log => reporter.log(log))
    .on('error', error => reporter.log(error));

  // lint the sources, transpile the sources and export the typings
  const processing = processFiles(paths.ROOT, [
    {
      include: globs.SOURCES,
      exclude: [globs.TESTS, globs.MOCKS, globs.FIXTURES],
      async process(file) {
        reporter.start();
        try {
          const linting = lintSourceFile(file).then(({errors, warnings}) => {
            errors.forEach(error => reporter.error(error));
            warnings.forEach(warning => reporter.warning(warning));
          });

          const transpilingCJS = transpile(file, createCJSFilename(file), babel.cjs());

          const transpilingESM = transpile(file, createESMFilename(file), babel.esm());

          const exporting = flow.export(file, createTypeFilename(file));

          await Promise.all([linting, transpilingCJS, transpilingESM, exporting]);
        } catch (error) {
          reporter.error({
            file: error.file || file,
            message: debug ? error.stack || error.message : error.message
          });
        }
        reporter.finish();
      },
      async delete(file) {
        try {
          await rm([createCJSFilename(file), createESMFilename(file), createTypeFilename(file)]);
        } catch (error) {
          reporter.error({
            file: error.file || file,
            message: debug ? error.stack || error.message : error.message
          });
        }
      }
    },
    {
      include: globs.EXAMPLE,
      async process(file) {
        reporter.start();
        try {
          const linting = lintExampleFile(file).then(({errors, warnings}) => {
            errors.forEach(error => reporter.error(error));
            warnings.forEach(warning => reporter.warning(warning));
          });
          await Promise.all([linting]);
        } catch (error) {
          reporter.error({
            file: error.file || file,
            message: debug ? error.stack || error.message : error.message
          });
        }
        reporter.finish();
      }
    }
  ]);

  process.on('SIGINT', () => {
    compiler.stop();
    processing.cancel();
    reporter.stop();
  });

  await processing;
  await reporter.wait();
}
