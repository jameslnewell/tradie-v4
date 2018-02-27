import {execFile} from 'child_process';
import flowPath from 'flow-bin';

/**
 * Execute flow
 * @param {string[]} args
 * @param {Object} options
 * @returns {Object}
 */
export default function(args: string[] = [], options: {} = {}): Promise<Object> {
  return new Promise((resolve, reject) => {
    //options.maxBuffer - process exits if more data is the max buffer
    execFile(flowPath, args, {...options, maxBuffer: 2000 * 1024}, (execError, stdout) => {
      if (args.indexOf('ast') !== -1 || args.indexOf('--json') !== -1) {
        try {
          const json = JSON.parse(String(stdout));
          if (json && json.exit) {
            reject(new Error(json.exit.msg));
          } else {
            resolve(json);
          }
        } catch (parseError) {
          reject(parseError);
        }
      } else if (execError) {
        reject(execError);
      } else {
        resolve();
      }
    });
  });
}
