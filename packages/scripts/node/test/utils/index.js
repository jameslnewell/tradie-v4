import path from 'path';
import {exec as execute} from 'child_process';
import fs from 'fs-extra';

export function fixture(name) {
  return path.join(__dirname, '..', '__fixtures__', name);
}

export async function mkdir(path) {
  return await fs.mkdirs(path);
}

export async function exists(path) {
  return await fs.exists(path);
}

export async function read(path) {
  const buffer = await fs.readFile(path);
  return buffer.toString();
}

export function exec(cmd, {cwd}) {
  const script = path.join(__dirname, '..', '..', 'lib', 'index.js');
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(cwd)) {
      reject(new Error(`cwd "${cwd}" does not exist.`));
      return;
    }

    execute(`node ${script} ${cmd}`, {cwd: cwd}, (error, stdout, stderr) => {
      if (error) {
        resolve({
          code: error.code,
          stdout,
          stderr
        });
      } else {
        resolve({
          code: 0,
          stdout,
          stderr
        });
      }
    });
  });
}
