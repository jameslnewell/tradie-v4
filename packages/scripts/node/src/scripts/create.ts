import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import Reporter from '@tradie/reporter-utils';
import generator from '@tradie/generator-utils';
import * as pkg from '../../package.json';
import { ROOT } from '../config/paths';
import { VirtualFileSystem } from '@tradie/generator-utils';

function fromFile(file: string, data: { [name: string]: string } = {}) {
  const filePath = require.resolve(`../../tpl/${file}`);
  const fileContents = fs.readFileSync(filePath).toString();
  return Object.keys(data).reduce(
    (contents, name) => contents.replace(new RegExp(`<%= ${name} %>`, 'g'), data[name]),
    fileContents
  );
}

export default async function ({directory = ROOT}: {directory?: string}) {
  const root = path.resolve(directory);

  const generate = (vfs: VirtualFileSystem) => {
    vfs.write('README.md', fromFile('README.md.ejs', { name: path.basename(root), version: pkg.version }));
    vfs.write('package.json', fromFile('package.json.ejs', { name: path.basename(root), version: pkg.version }));
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
    await generator(root, generate);
    cp.execSync('yarn');
    reporter.finished();
  } catch (error) {
    reporter.failed(error);
  }

  return reporter.wait();
}
