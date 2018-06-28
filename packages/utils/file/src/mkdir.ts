import * as fs from 'fs-extra';

export async function mkdir(path: string) {
  await fs.ensureDir(path);
}
