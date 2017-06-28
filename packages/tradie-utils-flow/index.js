const fs = require('fs-extra');
const path = require('path');
const execFile = require('child_process').execFile;
const chalk = require('chalk');
const padStart = require('lodash.padstart');
const flow = require('flow-bin');

class TypeChecker {
  constructor(directory, src, dest) {
    this.directory = directory;
    this.src = src; //FIXME: in order to get relative paths
    this.dest = dest; //FIXME: in order to get relative paths
  }

  enabled() {
    return fs.existsSync(path.resolve(this.directory, '.flowconfig'));
  }

  format(error) {
    //TODO: format like eslint
    let file = null;
    let line = null;
    let column = null;

    const lines = [];
    error.message.forEach(msg => {
      if (msg.type === 'Blame') {
        lines.push(`${chalk.bold(padStart(msg.line, 3))}: `);
        lines.push(`${msg.context.substr(0, msg.start - 1)}`);
        lines.push(
          `${chalk.red(
            msg.context.substr(msg.start - 1, msg.end - msg.start + 1)
          )}`
        );
        lines.push(`${msg.context.substr(msg.end)}`);
        lines.push(`\n`);
        lines.push(
          `     ${padStart('', msg.start - 1)}${'^'.repeat(
            msg.end - msg.start + 1
          )}`
        );
        lines.push(`     ${msg.descr}`);
        lines.push(`\n`);
        file = msg.path; //TODO: needs to be relative to src
        line = msg.line;
        column = msg.start;
      } else {
        lines.push(` ${msg.descr}\n`);
      }
    });

    return {
      file, //FIXME: this seems wrong in some occasions
      line,
      column,
      message: lines.join('')
    };
  }
  /**
   * Export the typings for a file
   * @param {string} file The full path to the file
   */
  typings(file) {
    const relFilePath = path.relative(this.src, file);
    const destFilePath = `${path.join(this.dest, relFilePath)}.flow`;
    return fs.copy(file, destFilePath);
  }

  check() {
    return new Promise((resolve, reject) => {
      //check flow is setup before running the check
      if (!this.enabled()) {
        resolve({errors: [], warnings: []});
        return;
      }

      execFile(
        flow,
        ['check', '--json'],
        {cwd: this.directory},
        (execError, stdout) => {
          try {
            const json = JSON.parse(stdout);
            resolve({
              errors: json.errors
                .filter(error => error.level === 'error')
                .map(error => this.format(error)),
              warnings: []
            });
          } catch (parseError) {
            reject(execError);
          }
        }
      );
    });
  }
}

module.exports = TypeChecker;
