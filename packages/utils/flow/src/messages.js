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
      sourceCodePointer = `${' '.repeat(start - 1)}${'^'.repeat(end - start + 1)}`;
    } else {
      sourceCodePointer = '^';
    }

    return [
      `${chalk.bold(lineAndColumn)} ${sourceCode}`,
      chalk.bold(`${' '.repeat(lineAndColumn.length)} ${sourceCodePointer} ${descr}`)
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

export function getErrors(directory: string, result: FlowResult) {
  return result.errors
    .filter(error => error.type === 'error')
    .map(error => ({
      file: error.message[0].path,
      message: formatError(directory, error)
    }))
    .filter(error => error.file.startsWith(path.resolve(directory)));
}

/* eslint-disable no-unused-vars */
export function getWarnings(directory: string, result: FlowResult) {
  // return result.errors
  //   .filter(error => error..type === '???')
  //   .map(error => format(directory, error))
  // ;
  return [];
}
