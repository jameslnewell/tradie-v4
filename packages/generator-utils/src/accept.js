// @flow
import {diffLines} from 'diff';
import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  type File,
  type FileMap,
  type FileStatus,
  type FileStatusMap
} from './types';

function printStatus(filePath: string, status: FileStatus) {
  console.log(chalk.yellow(`${chalk.bold(status)} ${filePath}`));
}

function printDiff(
  filePath: string,
  status: FileStatus,
  oldFile: File,
  newFile: File
) {
  switch (status) {
    case 'M': {
      const oldContents = oldFile.contents;
      const newContents = newFile.contents;

      const changes = diffLines(String(oldContents), String(newContents));

      //FIXME: showing too much whitespace. See:
      // - https://github.com/smallhelm/diff-lines/blob/master/index.js
      // - https://www.npmjs.com/package/disparity
      changes.forEach(change => {
        let lines = change.value.split(/(?:\r)?\n/);
        if (lines.length > 0 && lines[lines.length - 1] === '') {
          lines = lines.slice(0, lines.length - 1);
        }
        const output = lines
          .map(line => {
            const filteredLine = line.replace(/(?:\r)?\n/, '\\n');
            if (change.added) {
              return chalk.green(filteredLine);
            } else if (change.removed) {
              return chalk.red(filteredLine);
            } else {
              return `${filteredLine}`;
            }
          })
          .join('\n');
        console.log(output);
      });
      break;
    }

    default:
      break;
  }
}

export default function(
  statuses: FileStatusMap,
  oldFiles: FileMap,
  newFiles: FileMap
): Promise<FileStatusMap> {
  const acceptedStatuses = {};

  return Object.keys(statuses)
    .reduce(
      (promise, filePath) =>
        promise.then(() => {
          const status = statuses[filePath];
          const oldFile = oldFiles[filePath];
          const newFile = newFiles[filePath];

          printStatus(filePath, status);
          printDiff(filePath, status, oldFile, newFile);

          if (status === 'M') {
            const prompt = {
              type: 'confirm',
              name: 'accepted',
              message: 'Apply changes?',
              default: false
            };
            return inquirer.prompt([prompt]).then(answers => {
              console.log();
              if (answers.accepted) {
                acceptedStatuses[filePath] = status;
              }
            });
          } else {
            console.log();
            acceptedStatuses[filePath] = status;
            return Promise.resolve();
          }
        }),
      Promise.resolve()
    )
    .then(() => acceptedStatuses);
}
