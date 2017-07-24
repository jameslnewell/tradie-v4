import del from 'del';
import Linter from 'tradie-utils-eslint';
import Transpiler from 'tradie-utils-babel';
import TypeChecker from 'tradie-utils-flow';
import Processor from 'tradie-utils-processor';
import lint from './utils/lint';
import transpile from './utils/transpile';
import check from './utils/check';

export default function(options) {
  const {root, src, dest, eslint, babel, watch} = options;

  const linter = new Linter(root, eslint);
  const transpiler = new Transpiler(root, babel);
  const typechecker = new TypeChecker(root, src, dest);

  const processor = new Processor(root, {
    watch,
    include: [
      ...eslint.map(o => o.include),
      ...babel.map(o => o.include)
    ].reduce((a, b) => a.concat(b), []),
    // exclude: //FIXME: include eslint[x].include and babel[x].include to include perf,

    startedText: 'Building',
    finishedText: 'Built',

    unlink: () => del([]), //FIXME:
    process: (file, report) =>
      Promise.all([
        lint(linter)(file, report),
        transpile(transpiler)(file, report),
        typechecker.export(file).catch(error => report.error(file, error))
      ]),
    postProcessing: report => check(typechecker)(report)
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  return processor.run();
}
