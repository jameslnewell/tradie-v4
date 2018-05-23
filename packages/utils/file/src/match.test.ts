// @flow
import { match } from './match';

describe('match()', () => {
  it('should match on a full path when context is not provided', () => {
    const include = jest.fn().mockReturnValue(true);
    const exclude = jest.fn().mockReturnValue(false);
    const filter = match({ include, exclude });
    expect(filter('/foo/bar/index.js')).toBeTruthy();
    expect(include).toHaveBeenCalledWith('/foo/bar/index.js');
    expect(exclude).toHaveBeenCalledWith('/foo/bar/index.js');
  });

  it('should match on a relative path when context is provided', () => {
    const include = jest.fn().mockReturnValue(true);
    const exclude = jest.fn().mockReturnValue(false);
    const filter = match({ context: '/foo/bar', include, exclude });
    filter('/foo/bar/index.js');
    expect(include).toHaveBeenCalledWith('index.js');
    expect(exclude).toHaveBeenCalledWith('index.js');
  });

  it('should return true when no filter is provided', () => {
    const filter = match({});
    expect(filter('foobar')).toBeTruthy();
  });

  it('should return true when a glob include filter is passed and the value matches', () => {
    const filter = match({ include: 'f*bar' });
    expect(filter('foobar')).toBeTruthy();
  });

  it('should return true when a RegExp include filter is passed and the value matches', () => {
    const filter = match({ include: /foo/ });
    expect(filter('foobar')).toBeTruthy();
  });

  it('should return true when a function include filter is passed and the value matches', () => {
    const filter = match({ include: () => true });
    expect(filter('foobar')).toBeTruthy();
  });

  it('should return false when a glob include filter is passed and the value does not match', () => {
    const filter = match({ include: '*.js' });
    expect(filter('foobar')).toBeFalsy();
  });

  it('should return false when a RegExp include filter is passed and the value does not match', () => {
    const filter = match({ include: /xyz/ });
    expect(filter('foobar')).toBeFalsy();
  });

  it('should return false when a function include filter is passed and the value does not match', () => {
    const filter = match({ include: () => false });
    expect(filter('foobar')).toBeFalsy();
  });

  it('should return false when a glob exclude filter is passed and the value matches', () => {
    const filter = match({ exclude: 'f*bar' });
    expect(filter('foobar')).toBeFalsy();
  });

  it('should return false when a RegExp exclude filter is passed and the value matches', () => {
    const filter = match({ exclude: /foo/ });
    expect(filter('foobar')).toBeFalsy();
  });

  it('should return false when a function exclude filter is passed and the value matches', () => {
    const filter = match({ exclude: () => true });
    expect(filter('foobar')).toBeFalsy();
  });

  it('should return true when a glob exclude filter is passed and the value does not match', () => {
    const filter = match({ exclude: '*.js' });
    expect(filter('foobar')).toBeTruthy();
  });

  it('should return true when a RegExp exclude filter is passed and the value does not match', () => {
    const filter = match({ exclude: /xyz/ });
    expect(filter('foobar')).toBeTruthy();
  });

  it('should return true when a function exclude filter is passed and the value does not match', () => {
    const filter = match({ exclude: () => false });
    expect(filter('foobar')).toBeTruthy();
  });
});
