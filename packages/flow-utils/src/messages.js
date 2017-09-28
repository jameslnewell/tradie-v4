/* eslint-disable */
import path from 'path';
import chalk from 'chalk';
import {sprintf} from 'sprintf-js';

export type FlowResult = {
  passed: boolean,
  errors: Array<FlowError>,
  flowVersion: string,
  timing?: FlowTiming,
  memory?: FlowMemory
};

export type FlowError = {
  kind: string,
  level: string,
  message: Array<FlowMessage>,
  trace: ?Array<FlowMessage>,
  operation?: FlowMessage,
  extra?: FlowExtra
};

export type FlowMessage = {
  descr: string,
  type: 'Blame' | 'Comment',
  context?: ?string,
  loc?: ?FlowLoc,
  indent?: number
};

type FlowExtra = Array<{
  message: Array<FlowMessage>,
  children: FlowExtra
}>;

export type FlowLoc = {
  source: ?string,
  type: ?('LibFile' | 'SourceFile' | 'JsonFile' | 'Builtin'),
  start: FlowPos,
  end: FlowPos
};

type FlowPos = {
  line: number,
  column: number,
  offset: number
};

type FlowTimer = {
  start_age: number,
  duration: number
};

type FlowTiming = {
  results: {
    [key: string]: {
      // Legacy fields
      start_wall_age: number,
      wall_duration: number,

      // New hotness
      wall: FlowTimer,
      user: FlowTimer,
      system: FlowTimer,
      worker_user: FlowTimer,
      worker_system: FlowTimer
    }
  }
};

type FlowMemory = {
  [key: string]: number
};

export function formatMessage(directory: string, message: FlowMessage): string {
  const {context, descr, loc, line, endline, start, end} = message;

  if (context) {
    const lineAndColumn = sprintf('%3d:%-3d', line, start);

    const sourceCode = `${context.substr(0, start - 1)}${chalk.red(
      context.substr(start - 1, end - start + 1)
    )}${context.substr(end)}`;

    let sourceCodePointer = '';
    if (endline === line) {
      sourceCodePointer = `${' '.repeat(start - 1)}${'^'.repeat(
        end - start + 1
      )}`;
    } else {
      sourceCodePointer = '^';
    }

    return [
      `${chalk.bold(lineAndColumn)} ${sourceCode}`,
      chalk.bold(
        `${' '.repeat(lineAndColumn.length)} ${sourceCodePointer} ${descr}`
      )
    ].join('\n');
  } else {
    return `. ${chalk.bold(descr)}\n`;
  }
}

export function formatError(directory: string, error: FlowError) {
  const {message} = error;
  return message
    .map(m => formatMessage(directory, m))
    .join('')
    .trimRight();
}

export function formatResult(directory: string, result: FlowResult) {
  const {errors} = result;
  return result.errors.reduce((accum, error) => {
    const path = error.message[0].path;
    const message = formatError(directory, error);

    if (!accum[path]) {
      accum[path] = [];
    }
    accum[path].push(message);

    return accum;
  }, {});
}

export function _formatError(directory: string, error: FlowError) {
  //TODO: format like eslint
  let file = null;
  let line = null;
  let column = null;

  const content = [];
  error.message.forEach(msg => {
    if (msg.type === 'Blame') {
      const lineAndColumn = format('%3d:%-3d', msg.line, msg.start);

      //FIXME: when context is undefined
      const sourceCode = msg.context
        ? `${msg.context.substr(0, msg.start - 1)}${chalk.red(
            msg.context.substr(msg.start - 1, msg.end - msg.start + 1)
          )}${msg.context.substr(msg.end)}`
        : '';

      let sourceCodePointer = '';
      if (msg.endline !== msg.startline && msg.start < msg.end) {
        sourceCodePointer = `${' '.repeat(msg.start - 1)}${'^'.repeat(
          msg.end - msg.start + 1
        )}`;
      } else {
        //FIXME: handle when startline and endline aren't the same line or when its reversed
        //put a down marker at msg.start
        //print context code
        //put a up marker at msg.end
      }

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
  return result.errors.filter(error => error.level === 'error').map(error => ({
    file: error.message[0].path,
    message: formatError(directory, error)
  }));
}

/* eslint-disable no-unused-vars */
export function getWarnings(directory: string, result: FlowResult) {
  // return result.errors
  //   .filter(error => error.level === '???')
  //   .map(error => format(directory, error))
  // ;
  return [];
}
