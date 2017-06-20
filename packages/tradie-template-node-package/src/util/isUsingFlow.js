import fs from 'fs';
import path from 'path';

export default function({root}) {
  const flowConfigFile = path.resolve(root, '.flowconfig');
  return fs.existsSync(flowConfigFile);
}
