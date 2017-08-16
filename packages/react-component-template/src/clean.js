import path from 'path';

export default function({root}) {
  return {
    paths: [path.resolve(root, './dist'), path.resolve(root, './coverage')]
  };
}
