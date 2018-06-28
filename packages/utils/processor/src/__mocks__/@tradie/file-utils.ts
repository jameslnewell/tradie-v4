jest.dontMock('@tradie/file-utils');
export * from '@tradie/file-utils';

export const list = jest.fn().mockReturnValue(Promise.resolve([
  'package.json',
  'src/index.ts',
  'src/index.test.ts'
]));
