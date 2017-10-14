// @flow
import {name} from './name';

describe('name()', () => {
  it('should be the folder', () => {
    expect(name('foo/bar.jsx', '[folder]')).toEqual('foo');
  });

  it('should be the name', () => {
    expect(name('foo/bar.jsx', '[name]')).toEqual('bar');
  });

  it('should be the ext', () => {
    expect(name('foo/bar.jsx', '[ext]')).toEqual('.jsx');
    expect(name('foo/bar', '[ext]')).toEqual('');
  });

  it('should modify the extension', () => {
    expect(name('foo/bar.jsx', '[folder][name].js')).toEqual('foo/bar.js');
  });

  it('should append a new extension', () => {
    expect(name('foo/bar.jsx', '[folder][name][ext].flow')).toEqual(
      'foo/bar.jsx.flow'
    );
  });

  it('should be relative', () => {
    expect(
      name('/x/src/foo/bar.jsx', '[folder][name].js', {
        src: '/x/src',
        dest: '/x/lib'
      })
    ).toEqual('/x/lib/foo/bar.js');
  });
});
