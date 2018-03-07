import path from 'path';
import chalk from 'chalk';
import padStart from 'lodash.padstart';
import padEnd from 'lodash.padend';
import {type MessageType, type Message} from './types';

export type FormatOptions = {
  cwd?: string
};

const VERBOSE = Boolean(process.env.CI || process.env.DEBUG);

const BADGE_COLOR = {
  info: 'bgBlue',
  warn: 'bgYellow',
  error: 'bgRed'
};

function renderBadge(type: MessageType) {
  const text = type.toUpperCase();
  const color = BADGE_COLOR[type];
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
    ` in ${dir ? `${chalk.dim(dir)}${chalk.dim('/')}` : ''}${chalk.reset.white.bold(base)}\n\n`
  );
}

function shouldShowHeader(currentMessage: Message, previousMessage: Message[]) {
  return !previousMessage || previousMessage.file !== currentMessage.file;
}

function renderHeader(type: string, file?: string, cwd?: string) {
  return `${renderBadge(type)}${file ? renderFile(file, cwd) : ''}`;
}

function renderPosition(message: Message) {
  if (message.file && message.startPosition) {
    return `${chalk.bold(
      `${padStart(message.startPosition.line, 3)}:${padEnd(message.startPosition.column, 3)} `
    )} `;
  } else {
    return '';
  }
}

function indent(text: string) {
  return text
    .split('\n')
    .map(line => `${padStart('', 2, ' ')}${line}`)
    .join('\n');
}

function shouldShowTrace(message: Message) {
  return VERBOSE && message.trace;
}

function renderContent(message: Message) {
  return indent(`${renderPosition(message)}${message.text.trim()}`);
}

function renderTrace(message: Message) {
  return indent(message.trace);
}

export function formatMessages(messages: Message[], opts: FormatOptions = {}) {
  const formattedMessages = messages.map((currentMessage, index) => {
    const previousMessage = messages[index - 1];
    const {type, file} = currentMessage;
    const {cwd} = opts;

    return `${
      shouldShowHeader(currentMessage, previousMessage) ? renderHeader(type, file, cwd) : ''
    }${
      shouldShowTrace(currentMessage)
        ? `\n${renderTrace(currentMessage)}`
        : renderContent(currentMessage)
    }\n`;
  });
  return formattedMessages.join('\n');
}
