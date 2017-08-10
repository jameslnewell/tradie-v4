import fs from 'fs';
import path from 'path';
import exec from './exec';

export default class Flow {
  cwd: string;

  constructor(cwd: string) {
    this.cwd = cwd;
  }

  async exec(args, options = {}) {
    return exec(args, {...options, cwd: this.cwd});
  }

  async start() {
    await this.exec(['start']);
  }

  async stop() {
    await this.exec(['stop']);
  }

  async configured() {
    return new Promise((resolve, reject) =>
      fs.access(
        path.join(this.cwd, '.flowconfig'),
        fs.constants.R_OK,
        error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      )
    );
  }

  async annotated(file) {
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
    const json = JSON.parse(await this.exec(['status', '--json']));
    return json;
  }
}

// const flow = new Flow('/foo/bar');
// const configured = await flow.configured();
// const annotated = await flow.annotated(file);
