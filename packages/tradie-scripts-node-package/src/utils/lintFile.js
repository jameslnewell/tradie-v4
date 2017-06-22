export default function(linter, file, report) {
  return linter.lint(file).then(result => {
    if (result.error) report.error(file, result.error);
    if (result.warning) report.warning(file, result.warning);
  });
}
