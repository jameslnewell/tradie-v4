import path from 'path';
import getPaths from './utils/paths';

export default function({root}) {
  return {
    paths: [getPaths(root).dest, path.resolve(root, './coverage')]
  };
}
