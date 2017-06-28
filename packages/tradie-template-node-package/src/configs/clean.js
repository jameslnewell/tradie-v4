import path from 'path';
import getPaths from '../paths';

export default function({root}) {
  return {
    paths: [getPaths(root).dest, path.resolve(root, './coverage')]
  };
}
