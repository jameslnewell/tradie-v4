//@flow
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import {transformFile} from 'babel-core';

export type BabelOptions = {};

function formatError(error: SyntaxError) {
  if (error instanceof SyntaxError) {
    const match = error.message.match(/^([^:]+): (.*) \(([0-9]+:[0-9]+)\)$/);
    if (match) {
      const [, file, message, pos] = match;
      return {
        file,
        message: `${chalk.bold(pos)}    ${message}\n\n${(error: any).codeFrame}`
      };
    }
  }
  return {
    message: error.message
  };
}

export default async function(srcFile: string, destFile: string, options: BabelOptions = {}) {
  return new Promise((resolve, reject) => {
    transformFile(srcFile, {...options, filename: srcFile}, async function(transpileError, result) {
      if (transpileError) {
        reject(formatError(transpileError));
      } else {
        try {
          await fs.mkdirs(path.dirname(destFile));
          await fs.writeFile(destFile, result.code);
          //await fs.writeFile(`${destFilePath}.map`, result.map) //FIXME: only if there is a map
          resolve();
        } catch (writeError) {
          reject(writeError);
        }
      }
    });
  });
}
