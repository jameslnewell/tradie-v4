export default function(transpiler) {
  return (file, report) =>
    transpiler.transpile(file).catch(error => report.error(file, error, 1));
}
