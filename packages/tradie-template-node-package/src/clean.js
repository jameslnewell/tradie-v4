import path from 'path';

export default function(options) {
  return {
    paths: path.resolve(options.root, './lib')
  };
}
