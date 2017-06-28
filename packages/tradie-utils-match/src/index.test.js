// @flow
import matcher from '.';

describe('match()', () => {
  it('should match on a full path when root is not provided', () => {
    const include = jest.fn().mockReturnValue(true);
    const exclude = jest.fn().mockReturnValue(false);
    const match = matcher({include, exclude});
    expect(match('/foo/bar/index.js')).toBeTruthy();
    expect(include).toHaveBeenCalledWith('/foo/bar/index.js');
    expect(exclude).toHaveBeenCalledWith('/foo/bar/index.js');
  });

  it('should match on a relative path when root is provided', () => {
    const include = jest.fn().mockReturnValue(true);
    const exclude = jest.fn().mockReturnValue(false);
    const match = matcher({root: '/foo/bar', include, exclude});
    match('/foo/bar/index.js');
    expect(include).toHaveBeenCalledWith('index.js');
    expect(exclude).toHaveBeenCalledWith('index.js');
  });

  it('should return true when no filter is provided', () => {
    const match = matcher();
    expect(match('foobar')).toBeTruthy();
  });

  it('should return true when a glob include filter is passed and the value matches', () => {
    const match = matcher({include: 'f*bar'});
    expect(match('foobar')).toBeTruthy();
  });

  it('should return true when a RegExp include filter is passed and the value matches', () => {
    const match = matcher({include: /foo/});
    expect(match('foobar')).toBeTruthy();
  });

  it('should return true when a function include filter is passed and the value matches', () => {
    const match = matcher({include: () => true});
    expect(match('foobar')).toBeTruthy();
  });

  it('should return false when a glob include filter is passed and the value does not match', () => {
    const match = matcher({include: '*.js'});
    expect(match('foobar')).toBeFalsy();
  });

  it('should return false when a RegExp include filter is passed and the value does not match', () => {
    const match = matcher({include: /xyz/});
    expect(match('foobar')).toBeFalsy();
  });

  it('should return false when a function include filter is passed and the value does not match', () => {
    const match = matcher({include: () => false});
    expect(match('foobar')).toBeFalsy();
  });

  it('should return false when a glob exclude filter is passed and the value matches', () => {
    const match = matcher({exclude: 'f*bar'});
    expect(match('foobar')).toBeFalsy();
  });

  it('should return false when a RegExp exclude filter is passed and the value matches', () => {
    const match = matcher({exclude: /foo/});
    expect(match('foobar')).toBeFalsy();
  });

  it('should return false when a function exclude filter is passed and the value matches', () => {
    const match = matcher({exclude: () => true});
    expect(match('foobar')).toBeFalsy();
  });

  it('should return true when a glob exclude filter is passed and the value does not match', () => {
    const match = matcher({exclude: '*.js'});
    expect(match('foobar')).toBeTruthy();
  });

  it('should return true when a RegExp exclude filter is passed and the value does not match', () => {
    const match = matcher({exclude: /xyz/});
    expect(match('foobar')).toBeTruthy();
  });

  it('should return true when a function exclude filter is passed and the value does not match', () => {
    const match = matcher({exclude: () => false});
    expect(match('foobar')).toBeTruthy();
  });
});
