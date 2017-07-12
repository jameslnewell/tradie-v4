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
    if (args[0] !== 'check') {
      args.push('--json');
    }

    execFile(flowPath, [...args], options, (execError, stdout, stderr) => {
      try {
        resolve(JSON.parse(String(stdout)));
      } catch (parseError) {
        console.log(stdout, stderr);
        reject(parseError);
      }
    });
  });
}
