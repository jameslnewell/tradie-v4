import Reporter from '@tradie/reporter-utils';
import {compile} from '@tradie/webpack-utils';
import {copy, rm, name, process as processFiles} from '@tradie/file-utils';
import linter from '@tradie/eslint-utils';
import transpile from '@tradie/babel-utils';
import Flow from '@tradie/flow-utils';
import * as paths from '../config/paths';
import * as globs from '../config/globs';
import * as eslint from '../config/eslint';
import * as babel from '../config/babel';
import webpack from '../config/webpack';

const debug = process.env.CI || false;

export default async function(options: Options) {
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

          const transpilingCJS = transpile(
            file,
            name(file, '[folder][name].js', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST_CJS
            }),
            babel.cjs()
          );

          const transpilingESM = transpile(
            file,
            name(file, '[folder][name].js', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST_ESM
            }),
            babel.esm()
          );

          const exporting = flow.export(
            file,
            name(file, '[folder][name].js.flow', {
              src: paths.CODE_SRC,
              dest: paths.CODE_DEST_CJS
            })
          );

          await Promise.all([linting, transpilingCJS, transpilingESM, exporting]);
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
