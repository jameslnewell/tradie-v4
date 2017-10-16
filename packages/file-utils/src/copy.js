import fs from 'fs-extra';

export async function copy(src, dest) {
  await fs.copy(src, dest);
}
