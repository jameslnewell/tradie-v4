export default function(linter) {
  return (file, report) =>
    linter.lint(file).then(result => {
      if (result.error) report.error(file, result.error);
      if (result.warning) report.warning(file, result.warning);
    });
}
