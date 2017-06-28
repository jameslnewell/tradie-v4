//@flow
import chalk from 'chalk';
import padStart from 'lodash.padstart';
import trim from 'lodash.trim';

export type Message = {
  content: string | Error,
  priority: number
};

export type Messages = Array<Message>;

export function getHighestPriority(messages: Messages) {
  let highestPriority = Number.NEGATIVE_INFINITY;

  messages.forEach(message => {
    if (message.priority > highestPriority) {
      highestPriority = message.priority;
    }
  });

  return highestPriority;
}

export function filterByHighestPriority(messages: Messages) {
  const highestPriority = getHighestPriority(messages);
  return messages.filter(message => message.priority === highestPriority);
}

export function formatSyntaxError(error: string | Error) {
  const match = String(error).match(
    /SyntaxError: .*: (.*) \(([0-9]+):([0-9]+)\)/
  );
  if (!match) {
    return error;
  }

  const lines = String(error).split('\n');
  lines.shift();

  return [
    `${chalk.bold(`${match[2]}:${match[3]}`)}  ${match[1]}`,
    ...lines
  ].join('\n');
}

export function printMessages(type: string, file: string, messages: Messages) {
  let bgColor = null;
  switch (type) {
    case 'error':
      bgColor = 'bgRed';
      break;
    case 'warn':
      bgColor = 'bgYellow';
      break;
    default:
      bgColor = 'bgBlack';
      break;
  }

  console.log(chalk[bgColor](chalk.white(` in ${chalk.bold(file)}: `)));
  console.log();
  messages.forEach(message => {
    console.log(
      `${trim(
        String(
          message.content instanceof Error
            ? message.content.stack
            : message.content
        )
          .split('\n')
          .map(line => `${padStart('', 4)}${line}`)
          .join('\n'),
        '\n'
      )}`
    );
    console.log();
  });
}

export default function(type: string, file: string, messages: Messages) {
  printMessages(type, file, filterByHighestPriority(messages));
}
