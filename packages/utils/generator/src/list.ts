
import * as path from 'path';
import * as fs from 'fs-extra';
import finder from 'finder-on-steroids';
import { match, MatchFilter } from '@tradie/file-utils';
import { FileMap } from './types';

export type ListOptions = {
  include?: MatchFilter,
  exclude?: MatchFilter
};

/**
 * List all files
 */
export default function (
  src: string,
  opts: ListOptions = { exclude: /\/node_modules\// }
): Promise<FileMap> {
  const { include, exclude } = opts;
  const filter = (file: string) => match({ include, exclude });
  return finder(src)
    .files()
    .filter(filter)
    .find()
    .then((files: string[]) =>
      Promise.all(files.map((file: string) => fs.readFile(file).then((buffer: Buffer) => [file, buffer])))
    )
    .then((files: [string, Buffer][]) =>
      files.reduce((fileMap: FileMap, [filePath, fileBuffer]) => {
        fileMap[path.relative(src, filePath)] = {
          contents: fileBuffer.toString()
        };
        return fileMap;
      }, {})
    );
}
