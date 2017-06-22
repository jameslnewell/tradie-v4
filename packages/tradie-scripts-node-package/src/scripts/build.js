import del from 'del';
import Files from 'tradie-utils-file';
import Linter from 'tradie-utils-eslint';
import Transpiler from 'tradie-utils-babel';
import TypeChecker from 'tradie-utils-flow';
import Processor from 'tradie-utils-processor';
import lintFile from '../utils/lintFile';
import cleanFile from '../utils/cleanFile';
import checkFiles from '../utils/checkFiles';

export default function(options) {
  const {root, src, dest, include, exclude, babel, eslint, watch} = options;

  const linter = new Linter(src, eslint);
  const transpiler = new Transpiler(src, dest, babel);
  const typechecker = new TypeChecker(root, src, dest);

  const processFile = (file, report) =>
    Promise.all([
      lintFile(linter, file, report),
      transpiler.transpile(file),
      typechecker.typings(file)
    ]).then(() => checkFiles(typechecker, [file], report));

  const processFiles = (files, report) => {
    return Promise.all(
      files.map(file =>
        Promise.all([
          lintFile(linter, file, report),
          transpiler.transpile(file),
          typechecker.typings(file)
        ])
      )
    ).then(() => checkFiles(typechecker, files, report));
  };

  const cleanFile = file =>
    del([transpiler.destFile(file), typechecker.destFile(file)]);

  const processor = new Processor({
    directory: src,

    watch,
    include,
    exclude,

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
