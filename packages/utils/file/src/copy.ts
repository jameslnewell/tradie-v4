import * as fs from 'fs-extra';

export async function copy(src: string, dest: string) {
  await fs.copy(src, dest);
}
