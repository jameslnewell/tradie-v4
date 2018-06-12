import * as path from 'path';
import * as fs from 'fs-extra';
import * as extend from 'extend';
import { FileMap, FileStatusMap } from './types';
import VirtualFileSystem from './VirtualFileSystem';
import list from './list';
import diff from './diff';
import accept from './accept';
import apply from './apply';

export { VirtualFileSystem };

export default async function (directory: string, generate: (vfs: VirtualFileSystem) => void): Promise<void> {
  await fs.ensureDir(directory);
  const oldFiles = await list(directory);
  const newFiles = extend(true, {}, oldFiles);
  const vfs = new VirtualFileSystem({ files: newFiles });
  await Promise.resolve(generate(vfs));
  const statuses = diff(oldFiles, newFiles);
  const accepted = await accept(statuses, oldFiles, newFiles);
  await apply(directory, accepted, newFiles);
}
