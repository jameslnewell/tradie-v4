import finder, {Finder} from 'finder-on-steroids';

let mockPaths: string[] = [];

export default function(directory: string): Finder {
  const f = finder(directory);
  f.find = () => Promise.resolve(mockPaths);
  return f;
}

export function setPaths(paths: string[]): void {
  mockPaths = paths;
}
