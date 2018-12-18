import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { Argv, Arguments } from 'yargs';
import Reporter from '@tradie/reporter-utils';
import generator from '@tradie/generator-utils';
import { VirtualFileSystem } from '@tradie/generator-utils';
import {handleError} from '@tradie/cli-utils'
// @ts-ignore
import * as pkg from '../../package.json';

function fromFile(file: string, data: { [name: string]: string } = {}) {
  const filePath = require.resolve(`../../tpl/${file}`);
  const fileContents = fs.readFileSync(filePath).toString();
  return Object.keys(data).reduce(
    (contents, name) => contents.replace(new RegExp(`<%= ${name} %>`, 'g'), data[name]),
    fileContents
  );
}

export const command = 'create';
export const describe = ' Create a new project';
export const builder = (yargs: Argv) => yargs.strict();
export const handler = handleError(async () => {
  const cwd = process.cwd();

  const generate = (vfs: VirtualFileSystem) => {
    vfs.write('README.md', fromFile('README.md.ejs', { name: path.basename(cwd), version: pkg.version }));
    vfs.write('package.json', fromFile('package.json.ejs', { name: path.basename(cwd), version: pkg.version }));
    vfs.write('.gitignore', fromFile('.gitignore.ejs'));
    vfs.write('src/index.ts', fromFile('src/index.ts'));
    vfs.write('src/index.test.ts', fromFile('src/index.test.ts'));
    vfs.write('examples/index.ts', fromFile('examples/index.ts'));
  };

  const reporter = new Reporter({
    startedText: 'Creating',
    finishedText: 'Created'
  });

  reporter.started();
  try {
    await generator(cwd, generate);
    cp.execSync('yarn');
    reporter.finished();
  } catch (error) {
    reporter.failed(error);
  }

  return reporter.wait();
});
