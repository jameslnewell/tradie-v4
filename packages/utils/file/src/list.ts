import finder from 'finder-on-steroids';
import { match, MatchFilter } from './match';

export interface ListOptions {
  include?: MatchFilter;
  exclude?: MatchFilter;
};

export function list(dir: string, options: ListOptions = {}): Promise<string[]> {
  const { include, exclude } = options;

  const filter = match({
    include,
    exclude
  });

  return finder(dir)
    .files()
    .find()
    .then((files: string[]) => files.filter(filter));
}
