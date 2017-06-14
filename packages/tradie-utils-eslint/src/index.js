const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const table = require('text-table');
const CLIEngine = require('eslint').CLIEngine;

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
    errors[result.filePath] = text;
  });
  return errors;
}

export function getErrors(report) {
  return getMessages(report, message => message.severity === 2);
}

export function getWarnings(report) {
  return getMessages(report, message => message.severity === 1);
}

export class Linter {
  constructor(src, config = {}) {
    this.src = src;
    this.engine = new CLIEngine({
      cwd: this.src,
      ignore: false,
      useEslintrc: false,
      baseConfig: config
    });
  }

  lint(file) {
    const filePath = path.join(this.src, file);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (readError, text) => {
        if (readError) {
          reject(readError);
          return;
        }

        const report = this.engine.executeOnText(text.toString(), file);
        resolve({
          error: getErrors(report)[filePath],
          warning: getWarnings(report)[filePath]
        });
      });
    });
  }
}
