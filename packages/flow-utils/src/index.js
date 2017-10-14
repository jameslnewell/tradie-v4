// @flow
import path from 'path';
import fs from 'fs-extra';
import exec from './exec';
import {getErrors, getWarnings} from './messages';

export default class Flow {
  cwd: string;

  constructor(cwd: string) {
    this.cwd = path.resolve(cwd);
  }

  async exec(args: string[], options: {} = {}) {
    return exec(args, {...options, cwd: this.cwd});
  }

  async start() {
    await this.exec(['start']);
  }

  async stop() {
    await this.exec(['stop']);
  }

  async configured() {
    try {
      await fs.access(path.join(this.cwd, '.flowconfig'), fs.constants.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  async annotated(file: string) {
    const ast = await this.exec(['ast', file]);

    for (let i = 0; i < ast.comments.length; ++i) {
      const comment = ast.comments[i];
      if (/@flow/.test(comment.value)) {
        return true;
      }
    }

    return false;
  }

  async status() {
    if (!await this.configured()) {
      return {
        errors: [],
        warnings: []
      };
    }

    const result = await exec(['status', '--json'], {cwd: this.cwd});

    //report errors
    const errors = getErrors(this.cwd, result);

    //report warnings
    const warnings = getWarnings(this.cwd, result);

    return {
      errors,
      warnings
    };
  }

  async export(src: string, dest: string) {
    if (!await this.configured()) {
      return;
    }

    if (!await this.annotated(src)) {
      return;
    }

    await fs.mkdirs(path.dirname(dest));
    await fs.copy(src, dest);
  }
}
