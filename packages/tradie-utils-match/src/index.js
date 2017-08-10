// @flow
import path from 'path';
import anymatch from 'anymatch';

export type FilterFunction = (value: string) => boolean;
export type Filter =
  | string
  | RegExp
  | FilterFunction
  | Array<string | RegExp | FilterFunction>;

export type Options = {
  directory?: string,
  include?: Filter,
  exclude?: Filter
}; //cause flow

const defaultIncludeFilter = () => true;
const defaultExcludeFilter = () => false;

export default function(options: Options = {}): FilterFunction {
  const {
    directory,
    include = defaultIncludeFilter,
    exclude = defaultExcludeFilter
  } = options;

  const includeMatch = anymatch(include);
  const excludeMatch = anymatch(exclude);

  return (value: string) => {
    //match on the relative path
    if (directory) {
      value = path.relative(directory, value); //eslint-disable-line no-param-reassign
    }

    const included = includeMatch(value);
    const excluded = excludeMatch(value);

    if (!included) {
      return false;
    }

    if (excluded) {
      return false;
    }

    return true;
  };
}
