import * as path from 'path';
import * as fs from 'fs-extra';
import * as babel from '@babel/core';
import { Message } from '@tradie/reporter-utils';

function extractReasonAndFrame(error: Error) {
  const match = error.message.match(/^([^:]+): (.*) \(([0-9]+:[0-9]+)\)\n\n([\S\s]*)/);
  if (match) {
    const [,,reason,, frame] = match;
    return {
      reason,
      frame
    };
  } else {
    throw error;
  }
}

function convertParseErrorToMessage(src: string, error: Error): Message {
  const reasonAndFrame = extractReasonAndFrame(error);
  const {reason, frame} = reasonAndFrame;
  const loc = (error as any).loc;
  return {
    type: 'error',
    text: `${reason}\n\n${frame}`,
    file: src,
    startPosition: loc && {
      line: loc.line,
      column: loc.column,
    }
  };
}

/**
 * Transpile a file using babel
 * @param src The source file path
 * @param dest The destination file path
 * @param options The transpilation options
 */
export default async function(src: string, dest: string, options?: babel.TransformOptions): Promise<Message[]> {
  try {
    const result = await babel.transformFileAsync(src, {
      ...options,
      filename: src
    });
    if (!result) {
      return [];
    }
    await fs.mkdirs(path.dirname(dest));
    if (result.map) {
      await fs.writeFile(
        dest,
        `${result.code}\n//# sourceMappingURL=${`${path.basename(dest)}.map`}`
      );
      await fs.writeFile(
        `${dest}.map`,
        JSON.stringify(result.map)
      );
    } else {
      await fs.writeFile(
        dest,
        result.code
      );
    }
    return [];
  } catch (error) {
    if (error && error.code === 'BABEL_PARSE_ERROR') {
      return [convertParseErrorToMessage(src, error)];
    } else {
      throw error;
    }
  }
}
