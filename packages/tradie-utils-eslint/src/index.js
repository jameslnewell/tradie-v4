import fs from 'fs';
import path from 'path';
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
  constructor(directory, groups = []) {
    this.directory = directory;
    this.groups = groups.map(group => ({
      include: group.include,
      exclude: group.exclude,
      engine: new CLIEngine({
        cwd: this.directory,
        ignore: false,
        useEslintrc: false,
        baseConfig: group.config
      })
    }));
  }

  lint(file) {
    const fullFilePath = path.join(this.directory, file);

    const groupForFile = this.groups.find(group => {
      if (group.include && !group.include.test(file)) {
        return false;
      }

      if (group.exclude && group.exclude.test(file)) {
        return false;
      }

      return true;
    });

    if (!groupForFile) {
      return Promise.resolve({error: null, warning: null});
    }

    return new Promise((resolve, reject) => {
      fs.readFile(fullFilePath, (readError, text) => {
        if (readError) {
          reject(readError);
          return;
        }

        const report = groupForFile.engine.executeOnText(text.toString(), file);
        resolve({
          error: getErrors(report)[fullFilePath],
          warning: getWarnings(report)[fullFilePath]
        });
      });
    });
  }
}
