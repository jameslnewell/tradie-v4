export default function(yargs) {
  yargs.command('clean', 'remove generated files');

  yargs.command('lint', 'lint source and test files', {
    watch: {
      default: false,
      boolean: true,
      description: 'watch source files and re-lint them when they change'
    }
  });

  yargs.command('build', 'transpile source files');
  yargs.command('dev', 'start a dev server transpile source files');

  yargs.command('test', 'run test files', {
    watch: {
      default: false,
      boolean: true,
      description: 'watch test files and re-run them when they change'
    },
    coverage: {
      default: false,
      boolean: true,
      description: 'report test coverage'
    }
  });
}
