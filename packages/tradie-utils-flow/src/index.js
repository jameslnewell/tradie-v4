// @flow
import path from 'path';
import fs from 'fs-extra';
import exec from './exec';
import isFlowConfigured from './isFlowConfigured';
import isFileAnnotated from './isFileAnnotated';
import {getErrors, getWarnings} from './messages';

export default class TypeChecker {
  directory: string;
  src: string;
  dest: string;

  /**
   *
   * @param {string} directory The directory containing the `.flowconfig` file
   * @param {*} src
   * @param {*} dest
   */
  constructor(directory: string, src: string, dest: string) {
    this.directory = directory;
    this.src = src; //FIXME: in order to get relative paths
    this.dest = dest; //FIXME: in order to get relative paths
  }

  /**
   * Export the typings for a file
   * @param {string} file The full path to the file
   */
  async export(file: string) {
    if (isFlowConfigured(this.directory)) {
      return;
    }

    const annotated = await isFileAnnotated(file);
    if (!annotated) {
      return;
    }

    const relFilePath = path.relative(this.src, file);
    const destFilePath = `${path.join(this.dest, relFilePath)}.flow`;
    await fs.copy(file, destFilePath);
  }

  async check() {
    //check if flow is configured before wasting time checking
    if (!isFlowConfigured(this.directory)) {
      return {errors: [], warnings: []};
    }

    const result = await exec(['status'], {cwd: this.directory});
    return {
      errors: getErrors(this.directory, result),
      warnings: getWarnings(this.directory, result)
    };
  }
}
