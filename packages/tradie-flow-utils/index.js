const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const padStart = require('lodash.padstart');
const execFile = require('child_process').execFile;
const flow = require('flow-bin');

class TypeChecker {
  constructor(directory, src) {
    this.directory = directory;
    this.src = src; //FIXME: in order to get relative paths
  }

  enabled() {
    return fs.existsSync(path.resolve(this.directory, '.flowconfig'));
  }

  format(error) {
    let file = null;
    let line = null;
    let column = null;

    const lines = [];
    error.message.forEach(msg => {
      if (msg.type === 'Blame') {
        lines.push(`${padStart(msg.line, 3)}: `);
        lines.push(`${msg.context.substr(0, msg.start - 1)}`);
        lines.push(
          `${chalk.red(
            msg.context.substr(msg.start - 1, msg.end - msg.start + 1)
          )}`
        );
        lines.push(`${msg.context.substr(msg.end)}`);
        lines.push(`\n`);
        lines.push(`     ${padStart('', msg.start - 1)}^^^^^^^^^ ${msg.descr}`);
        file = path.relative(this.src, msg.path); //TODO needs to be relative to src
        line = msg.line;
        column = msg.start;
      } else {
        lines.push(` ${msg.descr}\n`);
      }
    });

    return {
      file: file,
      line: line,
      column: column,
      message: lines.join('')
    };
  }

  check() {
    return new Promise((resolve, reject) => {
      //check flow is setup before running the check
      if (!this.enabled()) {
        return resolve([]);
      }

      execFile(
        flow,
        ['check', '--json'],
        {cwd: this.directory},
        (execError, stdout) => {
          try {
            resolve(
              JSON.parse(stdout)
                .errors.filter(error => error.level === 'error')
                .map(error => this.format(error))
            );
          } catch (parseError) {
            reject(execError);
          }
        }
      );
    });
  }
}

module.exports = TypeChecker;
