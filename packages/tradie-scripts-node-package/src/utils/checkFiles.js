export default function(checker, files, report) {
  if (report.hasErrors()) {
    return Promise.resolve();
  }
  return checker.check().then(result => {
    result.errors
      .filter(error => files.indexOf(error.file) !== -1)
      .forEach(error => report.error(error.file, error.message));
    result.warnings
      .filter(warning => files.indexOf(warning.file) !== -1)
      .forEach(warning => report.error(warning.file, warning.message));
  });
}
