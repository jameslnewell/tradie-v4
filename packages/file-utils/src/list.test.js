import finder from 'finder-on-steroids';
import {list} from './list';

describe('list()', () => {
  afterEach(() => {
    finder.__setFiles([]);
  });

  it('should list source files', async () => {
    finder.__setFiles([
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
