import path from 'path';
import generator from 'tradie-utils-generator';

export default function(options) {
  const {root, generate} = options;

  return generator(root, generate);

  // 'flow-typed install jest'
  // 'yarn install';
}
