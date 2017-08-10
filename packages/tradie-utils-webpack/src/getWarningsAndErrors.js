import formatMessage from './formatMessage';

export default function(cwd: string, json: Object) {
  return {
    errors: json.errors.map(error => formatMessage(error, {cwd})),
    warnings: json.warnings.map(warning => formatMessage(warning, {cwd}))
  };
}
