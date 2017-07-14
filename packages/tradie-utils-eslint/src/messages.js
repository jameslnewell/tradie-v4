import chalk from 'chalk';
import table from 'text-table';

export function getMessages(report, filter) {
  const errors = {};
  report.results.forEach(result => {
    const file = result.filePath;
    const text = table(
      result.messages
        .filter(filter)
        .map(message => [
          chalk.bold(`${message.line}:${message.column}`),
          chalk.grey(message.ruleId || ''),
          message.message
        ]),
      {align: ['r', 'l', 'l']}
    );
    errors[file] = text;
  });
  return errors;
}

export function getErrors(report) {
  return getMessages(report, message => message.severity === 2);
}

export function getWarnings(report) {
  return getMessages(report, message => message.severity === 1);
}
