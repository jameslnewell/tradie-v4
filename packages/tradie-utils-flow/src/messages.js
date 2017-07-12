import path from 'path';
import chalk from 'chalk';
import {sprintf} from 'sprintf-js';

chalk.level = 0;

type FlowMessage = {
  tyoe: 'Blame' | 'Comment',
  path: string,
  line: number,
  start: number,
  end: number,
  context: string,
  descr: string
};

type FlowError = {
  level: 'error',
  message: Array<FlowMessage>
};

type FlowResult = {};

export function format(directory: string, error: FlowError) {
  //TODO: format like eslint
  let file = null;
  let line = null;
  let column = null;

  const content = [];
  error.message.forEach(msg => {
    if (msg.type === 'Blame') {
      const lineAndColumn = sprintf('%3d:%-3d', msg.line, msg.start);

      const sourceCode = `${msg.context.substr(0, msg.start - 1)}${chalk.red(
        msg.context.substr(msg.start - 1, msg.end - msg.start + 1)
      )}${msg.context.substr(msg.end)}`;

      const sourceCodePointer = `${' '.repeat(msg.start - 1)}${'^'.repeat(
        msg.end - msg.start + 1
      )}`;

      const description = `${msg.descr}`;

      content.push(`${chalk.bold(lineAndColumn)} ${sourceCode}\n`);
      content.push(
        chalk.bold(
          `${' '.repeat(
            lineAndColumn.length
          )} ${sourceCodePointer} ${description}`
        )
      );

      if (!file) {
        file = msg.path;
        line = msg.line;
        column = msg.start;
      } else if (file !== msg.path) {
        const relFile = path.relative(directory, msg.path);
        content.push(
          chalk.bold(`. See: ${chalk.underline(`${relFile}:${msg.line}`)}`)
        );
      }
    } else if (msg.type === 'Comment') {
      content.push(`. ${chalk.bold(msg.descr)}\n`);
    }
  });

  return {
    file,
    line,
    column,
    message: content.join('')
  };
}

export function getErrors(directory: string, result: FlowResult) {
  return result.errors
    .filter(error => error.level === 'error')
    .map(error => format(directory, error));
}

/* eslint-disable no-unused-vars */
export function getWarnings(directory: string, result: FlowResult) {
  // return result.errors
  //   .filter(error => error.level === '???')
  //   .map(error => format(directory, error))
  // ;
  return [];
}