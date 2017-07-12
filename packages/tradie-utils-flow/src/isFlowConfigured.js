import fs from 'fs';
import path from 'path';

export default function(directory: string) {
  return fs.existsSync(path.resolve(directory, '.flowconfig'));
}
