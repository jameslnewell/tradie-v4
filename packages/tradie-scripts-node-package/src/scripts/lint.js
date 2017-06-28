import Linter from 'tradie-utils-eslint';
import TypeChecker from 'tradie-utils-flow';
import Processor from 'tradie-utils-processor';
import matcher from 'tradie-utils-match';
import lint from '../utils/lint';
import check from '../utils/check';

export default function(options) {
  const {watch, root, src, dest, sourceOptions, testOptions} = options;

  const files = {
    source: {
      match: matcher({
        root,
        include: sourceOptions.include,
        exclude: sourceOptions.exclude
      }),
      linter: new Linter(sourceOptions.eslint)
    },
    test: {
      match: matcher({
        root,
        include: testOptions.include,
        exclude: testOptions.exclude
      }),
      linter: new Linter(testOptions.eslint)
    }
  };

  const typechecker = new TypeChecker(root, src, dest);

  const processor = new Processor(root, {
    watch,
    include: value => files.source.match(value) || files.test.match(value),

    process: (file, report) => {
      if (files.source.match(file)) {
        return lint(files.source.linter)(file, report);
      }
      if (files.test.match(file)) {
        return lint(files.test.linter)(file, report);
      }
      return Promise.resolve();
    },
    postProcessing: report => check(typechecker)(report),

    startedText: 'Linting',
    finishedText: 'Linted'
  });

  process.on('SIGINT', () => {
    processor.stop();
  });

  return processor.run();
}
