import path from 'path';
import getBabelConfig from './util/getBabelConfig';

export default function(options) {
  return {
    root: options.root,
    src: path.resolve(options.root, './src'),
    dest: path.resolve(options.root, './lib'),
    include: /\.jsx?$/,
    exclude: /(?:\.test\.jsx?$|\/__mocks__\/)/, //ignore test files i.e. `**/__mocks__/**` and `**/*.test.jsx`
    babel: getBabelConfig(options),
    eslint: {
      extends: ['jameslnewell/es'],
      env: {node: true},
      rules: {
        'no-console': 1
      }
    },
    watch: options.watch
  };
}
