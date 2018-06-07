
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
  const filter = (file: string): boolean => match({ include, exclude })(file);
  return finder(src)
    .files()
    .filter(filter)
    .find()
    .then((files: string[]) =>
      Promise.all(files.map((file: string) => fs.readFile(file).then((buffer) => [file, buffer])))
    )
    .then((files) =>
      files.reduce((fileMap: FileMap, file) => {
        const [filePath, fileBuffer]: [string, Buffer] = file as [string, Buffer];
        fileMap[path.relative(src, filePath)] = {
          contents: fileBuffer.toString()
        };
        return fileMap;
      }, {})
    );
}
