import generator from '@tradie/generator-utils';

export default function(options) {
  const {root, generate} = options;

  return generator(root, generate);

  // 'flow-typed install jest'
  // 'yarn install';
}
