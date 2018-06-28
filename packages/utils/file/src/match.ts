
import * as path from 'path';
import * as anymatch from 'anymatch';

export type MatchFilterFunction = (value: string) => boolean;
export type MatchFilterPrimative = string | RegExp | MatchFilterFunction;
export type MatchFilterArray = MatchFilterPrimative[];
export type MatchFilter = MatchFilterPrimative | MatchFilterArray;

export interface MatchOptions {
  context?: string,
  include?: MatchFilter,
  exclude?: MatchFilter
};

const defaultIncludeFilter = () => true;
const defaultExcludeFilter = () => false;

export function match(options: MatchOptions): MatchFilterFunction {
  const { context, include = defaultIncludeFilter, exclude = defaultExcludeFilter } = options;

  const includeMatch = anymatch(include);
  const excludeMatch = anymatch(exclude);

  return (file: string) => {
    // match on the relative path
    if (context) {
      file = path.relative(context, file);
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
