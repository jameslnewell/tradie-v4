// @flow
import del from 'del';

export async function rm(files: string | string[]) {
  await del(files);
}
