import fs from 'fs';
import {version} from '../../package.json';

function fromFile(file, data = {}) {
  const filePath = require.resolve(`../tpl/${file}`);
  const fileContents = fs.readFileSync(filePath).toString();

  return Object.keys(data).reduce(
    (contents, name) => fileContents.replace(`<%= ${name} %>`, data[name]),
    fileContents
  );
}

function generate(vfs) {
  vfs.write('package.json', fromFile('package.json', {version}));
  vfs.write('.flowconfig', fromFile('.flowconfig'));
  vfs.write('.gitignore', fromFile('.gitignore'));
  vfs.write('src/index.js', fromFile('src/index.js'));
  vfs.write('src/index.test.js', fromFile('src/index.test.js'));
}

export default function(options) {
  const {root} = options;
  return {
    root,
    generate
  };
}
