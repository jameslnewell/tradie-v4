// @flow
import path from 'path';

export type NameOptions = {
  src?: string,
  dest?: string
};

export function name(
  file: string,
  pattern: string,
  options: NameOptions = {}
): string {
  const {src = '.', dest = '.'} = options;
  const info = path.parse(path.relative(src, file));
  const fname = pattern
    .replace('[folder]', info.dir.length ? `${info.dir}/` : info.dir)
    .replace('[name]', info.name)
    .replace('[ext]', info.ext === '.' ? '' : info.ext);
  const fpath = path.join(path.resolve(dest), fname).replace(/(\/|\\)$/, '');
  return fpath === '.' ? '' : fpath;
}
