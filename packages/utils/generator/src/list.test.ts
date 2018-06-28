jest.dontMock('fs-extra');
jest.dontMock('finder-on-steroids');

import list from './list';

describe('list()', () => {

  it('should error', async () => {
    expect(list('non-existent-dir')).rejects.toEqual(expect.objectContaining({
      code: 'ENOENT',
      message: expect.stringContaining('no such file or directory')
    }));
  });

  it('should return a map of file contents', async () => {
    const fileMap = await list('.')
  });

});
