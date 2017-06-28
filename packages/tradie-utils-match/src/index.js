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
  root?: string,
  include?: Filter,
  exclude?: Filter
}; //cause flow

/* eslint-disable no-unused-vars */ const defaultIncludeFilter = value => true;
const defaultExcludeFilter = value => false;
/* eslint-enable no-unused-vars */

export default function(options: Options = {}): FilterFunction {
  const {
    root,
    include = defaultIncludeFilter,
    exclude = defaultExcludeFilter
  } = options;

  const includeMatch = anymatch(include);
  const excludeMatch = anymatch(exclude);

  return (value: string) => {
    //match on the relative path
    if (root) {
      value = path.relative(root, value); //eslint-disable-line no-param-reassign
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
