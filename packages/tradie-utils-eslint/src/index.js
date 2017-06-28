import fs from 'fs';
import chalk from 'chalk';
import table from 'text-table';
import {CLIEngine} from 'eslint';

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

export default class Linter {
  constructor(config) {
    this.engine = new CLIEngine({
      ignore: false,
      useEslintrc: false,
      baseConfig: config
    });
  }

  /**
   * Perform linting on a single file
   * @param {string} file The full path to a file
   */
  lint(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (readError, text) => {
        if (readError) {
          reject(readError);
          return;
        }
        const report = this.engine.executeOnText(text.toString(), file);
        resolve({
          error: getErrors(report)[file],
          warning: getWarnings(report)[file]
        });
      });
    });
  }
}
