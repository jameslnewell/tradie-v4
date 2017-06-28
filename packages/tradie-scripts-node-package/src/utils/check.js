export default function(checker) {
  return report => {
    if (report.hasErrors()) {
      return Promise.resolve();
    }
    return checker.check().then(result => {
      //FIXME: ignore errors outside of the included files e.g. lib dir
      result.errors //FIXME: these are coming out a bit wrong
        // .filter(error => files.indexOf(error.file) !== -1) //TODO: need to know what files we're specifically checking for because flow checks all of them
        .forEach(error => report.error(error.file, error.message));
      result.warnings
        // .filter(warning => files.indexOf(warning.file) !== -1) //TODO: need to know what files we're specifically checking for because flow checks all of them
        .forEach(warning => report.error(warning.file, warning.message));
    });
  };
}
