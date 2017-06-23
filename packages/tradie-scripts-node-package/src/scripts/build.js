import del from 'del';
import ESLint from 'tradie-utils-eslint';
import Babel from 'tradie-utils-babel';
import Flow from 'tradie-utils-flow';
import Processor from 'tradie-utils-processor';
import lintFile from '../utils/lintFile';
import checkFiles from '../utils/checkFiles';

export default function(options) {
  const {root, src, dest, include, exclude, babel, eslint, watch} = options;

  const linter = new ESLint(src, [
    {
      include,
      exclude,
      config: eslint
    }
  ]);
  const transpiler = new Babel(src, dest, babel);
  const typechecker = new Flow(root, src, dest);

  const processFile = (file, report) =>
    Promise.all([
      lintFile(linter, file, report),
      transpiler.transpile(file),
      typechecker.typings(file)
    ]).then(() => checkFiles(typechecker, [file], report));

  const processFiles = (files, report) =>
    Promise.all(
      files.map(file =>
        Promise.all([
          lintFile(linter, file, report),
          transpiler.transpile(file),
          typechecker.typings(file)
        ])
      )
    ).then(() => checkFiles(typechecker, files, report));

  const unlinkFile = file =>
    del([babel.destFile(file), typechecker.destFile(file)]);

  const processor = new Processor({
    directory: src,

    watch,
    include,
    exclude,

    unlinkFile,
    processFile,
    processFiles,

    startedText: 'Building',
    finishedText: 'Built'
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  return processor.run();
}
