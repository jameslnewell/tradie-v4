// @flow
/* eslint-disable no-unused-vars */
import path from 'path';
import fs from 'fs-extra';
import finder from 'finder-on-steroids';
import match, {type Filter} from '@tradie/match-utils';
import {type FileMap} from './types';

export type ListOptions = {
  include?: Filter,
  exclude?: Filter
};

/**
 * List all files
 * @param {string} src
 * @param {ListOptions} [opts]
 */
export default function(
  src: string,
  opts: ListOptions = {exclude: /\/node_modules\//}
): Promise<FileMap> {
  const {include, exclude} = opts;
  const filter = file => match({include, exclude});
  return finder(src)
    .files()
    .filter(filter)
    .find()
    .then(files =>
      Promise.all(
        files.map(file => fs.readFile(file).then(contents => [file, contents]))
      )
    )
    .then(files =>
      files.reduce((fileMap, [filePath, contents]) => {
        fileMap[path.relative(src, filePath)] = {contents: contents.toString()};
        return fileMap;
      }, {})
    );
}
