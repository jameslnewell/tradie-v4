import path from 'path';

export default function(root) {
  return {
    root,
    src: path.resolve(root, './src'),
    dest: path.resolve(root, './lib')
  };
}
