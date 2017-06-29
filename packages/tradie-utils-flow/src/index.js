// @flow
import path from 'path';
import {execFile} from 'child_process';
import fs from 'fs-extra';
import flow from 'flow-bin';
import {getErrors, getWarnings} from './messages';

export default class TypeChecker {
  directory: string;
  src: string;
  dest: string;

  constructor(directory: string, src: string, dest: string) {
    this.directory = directory;
    this.src = src; //FIXME: in order to get relative paths
    this.dest = dest; //FIXME: in order to get relative paths
  }

  enabled() {
    return fs.existsSync(path.resolve(this.directory, '.flowconfig'));
  }

  /**
   * Export the typings for a file
   * @param {string} file The full path to the file
   */
  typings(file: string) {
    //FIXME: check the file has the `@flow` annotation //from CRAP: /^\s*\/\/.*@flow/.test(contents) || /^\s*\/\*.*@flow/.test(contents)
    const relFilePath = path.relative(this.src, file);
    const destFilePath = `${path.join(this.dest, relFilePath)}.flow`;
    return fs.copy(file, destFilePath);
  }

  //TODO: stop and start the server on the first run to make it faster when the running version of flow is different version (see flowVersion returned by json)

  check() {
    return new Promise((resolve, reject) => {
      //check flow is setup before running the check
      if (!this.enabled()) {
        resolve({errors: [], warnings: []});
        return;
      }
      execFile(
        flow,
        ['status', '--json'],
        {cwd: this.directory},
        (execError, stdout) => {
          try {
            const result = JSON.parse(String(stdout));
            resolve({
              errors: getErrors(this.directory, result),
              warnings: getWarnings(this.directory, result)
            });
          } catch (parseError) {
            reject(execError);
          }
        }
      );
    });
  }
}
