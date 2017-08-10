import {execFile} from 'child_process';
import flowPath from 'flow-bin';

/**
 * Execute flow
 * @param {string[]} args
 * @param {Object} options
 * @returns {Object}
 */
export default function(
  args: string[] = [],
  options: {} = {}
): Promise<Object> {
  return new Promise((resolve, reject) => {
    if (args[0] !== 'ast') {
      args.push('--json');
    }
    //options.maxBuffer - process exits if more data is the max buffer
    execFile(
      flowPath,
      args,
      {...options, maxBuffer: 2000 * 1024},
      (execError, stdout) => {
        try {
          resolve(JSON.parse(String(stdout)));
        } catch (parseError) {
          reject(parseError);
        }
      }
    );
  });
}
