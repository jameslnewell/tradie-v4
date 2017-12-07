import finder from 'finder-on-steroids';
import {match, Filter} from './match';

export type ListOptions = {
  include?: Filter,
  exclude?: Filter
};

export function list(dir: string, options: ListOptions = {}): Promise<string[]> {
  const {include, exclude} = options;

  const filter = match({
    context: dir,
    include,
    exclude
  });

  return finder(dir)
    .files()
    .find()
    .then(files => files.filter(filter));
}
