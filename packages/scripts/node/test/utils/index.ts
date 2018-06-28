import * as os from 'os';
import * as path from 'path';
import {exec as execute} from 'child_process';
import * as fs from 'fs-extra';

const fixtures = [];

export async function createFixture(name: string): Promise<string> {
  const srcPath = path.join(__dirname, '..', '__fixtures__', name);
  const destPath = await fs.mkdtemp(path.join(os.tmpdir(), name));
  fixtures.push(destPath);
  await fs.copy(srcPath, destPath);
  return new Promise<string>((resolve, reject) => {
    execute('yarn', {cwd: destPath}, async (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(destPath);
      }
    });
  });
}

export async function cleanFixtures() {
  await Promise.all(fixtures.map(dir => fs.emptyDir(dir)));
}

export async function mkdir(path) {
  return await fs.mkdirs(path);
}

export async function exists(path): Promise<boolean> {
  return await fs.pathExists(path);
}

export async function read(path) {
  const buffer = await fs.readFile(path);
  return buffer.toString();
}

export function exec(cmd: string, {cwd}: {cwd: string}): Promise<{code: number, stdout: string, stderr: string}> {
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
