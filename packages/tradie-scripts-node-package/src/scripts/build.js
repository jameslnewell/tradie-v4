import del from 'del';
import Linter from 'tradie-utils-eslint';
import Transpiler from 'tradie-utils-babel';
import TypeChecker from 'tradie-utils-flow';
import Processor from 'tradie-utils-processor';
import lint from '../utils/lint';
import check from '../utils/check';

export default function(options) {
  const {root, src, dest, include, exclude, babel, eslint, watch} = options;

  const linter = new Linter(eslint);
  const transpiler = new Transpiler(src, dest, babel);
  const typechecker = new TypeChecker(root, src, dest);

  const processor = new Processor(root, {
    watch,
    include,
    exclude,

    unlink: file => del([babel.destFile(file), typechecker.destFile(file)]), //FIXME:
    process: (file, report) =>
      Promise.all([
        lint(linter)(file, report),
        transpiler.transpile(file).catch(error => report.error(file, error, 1)),
        typechecker.typings(file)
      ]),
    postProcessing: report => check(typechecker)(report),

    startedText: 'Building',
    finishedText: 'Built'
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  return processor.run();
}
