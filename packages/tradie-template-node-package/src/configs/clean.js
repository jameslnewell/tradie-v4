import path from 'path';

export default function({root}) {
  return {
    paths: [path.resolve(root, './lib'), path.resolve(root, './coverage')]
  };
}
