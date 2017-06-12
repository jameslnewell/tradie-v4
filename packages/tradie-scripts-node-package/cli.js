module.exports = function(yargs) {
  yargs.command('build', 'transpile source files').option('watch', {
    default: false,
    boolean: true,
    description: 'watch source files and re-transpile when they change'
  });

  yargs.command('test', 'run test files').option('watch', {
    default: false,
    boolean: true,
    description: 'watch source files and re-transpile when they change'
  });
};
