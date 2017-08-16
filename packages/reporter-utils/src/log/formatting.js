import path from 'path';
import chalk from 'chalk';
import padStart from 'lodash.padstart';
import {type Level, type Record} from './types';

export type FormatOptions = {
  cwd?: string
};

const BADGE_COLOR = {
  info: 'bgBlue',
  warn: 'bgYellow',
  error: 'bgRed'
};

function renderBadge(level: Level) {
  const text = level.toUpperCase();
  const color = BADGE_COLOR[level];
  return chalk[color].white.bold(` ${text} `);
}

function renderFile(file: string, cwd?: string) {
  //show the path relative to the cwd
  let filePath = file;
  if (cwd) {
    filePath = path.relative(cwd, file);
    if (!filePath.startsWith('../')) {
      filePath = `./${filePath}`;
    }
  }

  const {dir, base} = path.parse(filePath);
  return chalk.dim(
    ` in ${dir
      ? `${chalk.dim(dir)}${chalk.dim('/')}`
      : ''}${chalk.reset.white.bold(base)}`
  );
}

function renderShortMessage(message: string) {
  return message;
}

function renderLongMessage(message: string) {
  return message
    .split('\n')
    .map(line => `${padStart('', 2, ' ')}${line}`)
    .join('\n');
}

export function formatLog(log: Record, opts: FormatOptions = {}) {
  const {level, file, message} = log;
  const {cwd} = opts;

  const isMultiLineMessage = /\n/.test(message);

  if (!file && !isMultiLineMessage) {
    return `${renderBadge(level)}${file
      ? renderFile(file, cwd)
      : ''} ${renderShortMessage(message)}\n`;
  }

  return `${renderBadge(level)}${file
    ? renderFile(file, cwd)
    : ''}\n\n${renderLongMessage(message)}\n`;
}

export function formatLogs(logs: Record[], opts: FormatOptions = {}) {
  return logs.map(log => formatLog(log, opts)).join('\n');
}
