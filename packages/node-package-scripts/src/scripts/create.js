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
  vfs.write('package.json', fromFile('package.json.tpl', {version}));
  vfs.write('.flowconfig', fromFile('.flowconfig.tpl'));
  vfs.write('.gitignore', fromFile('.gitignore.tpl'));
  vfs.write('src/index.js', fromFile('src/index.js'));
  vfs.write('src/index.test.js', fromFile('src/index.test.js'));
  vfs.write('examples/index.js', fromFile('examples/index.js'));
}

export default async function() {
  await generator(ROOT, generate);

  cp.execSync('yarn');
  cp.execSync('flow-typed install jest@21 --flowVersion 0.53.0');

  console.log('Project created.');
}
