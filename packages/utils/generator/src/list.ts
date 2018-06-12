
import * as path from 'path';
import * as fs from 'fs-extra';
import finder from 'finder-on-steroids';
import { match, MatchFilter } from '@tradie/file-utils';
import { FileMap } from './types';

export interface ListOptions {
  include?: MatchFilter,
  exclude?: MatchFilter
};

/**
 * List all files
 */
export default async function (
  src: string,
  opts: ListOptions = { exclude: /\/node_modules\// }
): Promise<FileMap> {
  const { include, exclude } = opts;
  const filter = (file: string): boolean => match({ include, exclude })(file);
  const files = await finder(src)
  .files()
  .include(filter)
  .find();
  const filesAndContents = await Promise.all(files.map((file: string) => fs.readFile(path.join(src, file)).then((buffer) => [file, buffer])));
  return filesAndContents.reduce((fileMap: FileMap, fileAndContents) => {
    const [filePath, fileBuffer]: [string, Buffer] = fileAndContents as [string, Buffer];
    fileMap[path.relative(src, filePath)] = {
      contents: fileBuffer.toString()
    };
    return fileMap;
  }, {});
}
