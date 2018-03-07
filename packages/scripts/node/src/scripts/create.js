import fs from 'fs';
import cp from 'child_process';
import generator from '@tradie/generator-utils';
import {version} from '../../package.json';
import {ROOT} from '../config/paths';

function fromFile(file, data = {}) {
  const filePath = require.resolve(`../../tpl/${file}`);
  const fileContents = fs.readFileSync(filePath).toString();
  return Object.keys(data).reduce(
    (contents, name) => fileContents.replace(`<%= ${name} %>`, data[name]),
    fileContents
  );
}

function generate(vfs) {
  vfs.write('package.json', fromFile('package.json.ejs', {version}));
  vfs.write('.gitignore', fromFile('.gitignore.ejs'));
  vfs.write('src/index.ts', fromFile('src/index.ts'));
  vfs.write('src/index.test.ts', fromFile('src/index.test.ts'));
  vfs.write('examples/index.ts', fromFile('examples/index.ts'));
}

export default async function() {
  await generator(ROOT, generate);

  cp.execSync('yarn');

  console.log('Project created.');
}
