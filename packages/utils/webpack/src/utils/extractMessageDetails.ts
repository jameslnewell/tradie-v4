import * as path from 'path';

//adapted from: https://github.com/lukeed/webpack-format-messages/blob/master/index.js

const stackRegex = /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/;
const debug = false;

export interface ExtractMessageDetailsOptions {
  cwd?: string;
}

export function extractMessageDetails(message: string, options: ExtractMessageDetailsOptions = {}) {
  const {cwd = '.'} = options;
  let file = null;

  //TODO: format syntax errors
  let lines = message.split('\n');

  //extract and remove the filename
  if (lines[0] && /.\/|..\//.test(lines[0])) {
    file = path.resolve(cwd, lines[0]);
    lines = lines.slice(1);
  }

  //if we're debugging, return the unmodified message with all the information
  if (debug) {
    return {
      file,
      message
    };
  }

  ///SyntaxError: .*: (.*) \(([0-9]+):([0-9]+)\)/

  //remove useless `entry` filename stack details
  lines = lines.filter(line => line.indexOf(' @ ') !== 0);

  //remove stack traces from loaders and webpack itself
  lines = lines.filter(line => !stackRegex.test(line));

  return {
    file,
    message: lines.join('\n').trim()
  };
}
