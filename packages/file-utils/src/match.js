// @flow
import path from 'path';
import anymatch from 'anymatch';

export type FilterFunction = (value: string) => boolean;
export type Filter =
  | string
  | RegExp
  | FilterFunction
  | Array<string | RegExp | FilterFunction>;

export type MatchOptions = {
  context?: string,
  include?: Filter,
  exclude?: Filter
};

const defaultIncludeFilter = () => true;
const defaultExcludeFilter = () => false;

export function match(options: MatchOptions): FilterFunction {
  const {
    context,
    include = defaultIncludeFilter,
    exclude = defaultExcludeFilter
  } = options;

  const includeMatch = anymatch(include);
  const excludeMatch = anymatch(exclude);

  return (file: string) => {
    //match on the relative path
    if (context) {
      file = path.relative(context, file); //eslint-disable-line no-param-reassign
      // FIXME: exclude files not in the context directory??
    }

    const included = includeMatch(file);
    if (!included) {
      return false;
    }

    const excluded = excludeMatch(file);
    if (excluded) {
      return false;
    }

    return true;
  };
}
