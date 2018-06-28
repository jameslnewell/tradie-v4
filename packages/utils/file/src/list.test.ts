import finder, {__setPaths} from 'finder-on-steroids';
import {list} from './list';

declare module 'finder-on-steroids' {
  export function __setPaths(paths: string[]): void;
}

describe('list()', () => {
  afterEach(() => {
    __setPaths([]);
  });

  it('should list source files', async () => {
    __setPaths([
      '/users/dev/math/.gitignore',
      '/users/dev/math/package.json',
      '/users/dev/math/src/sum.js',
      '/users/dev/math/src/sum.test.js'
    ]);

    const files = await list('/users/dev/math', {
      include: '**/*.js',
      exclude: '**/*.test.js'
    });

    expect(files).toHaveLength(1);
    expect(files).toEqual(['/users/dev/math/src/sum.js']);
  });
});
