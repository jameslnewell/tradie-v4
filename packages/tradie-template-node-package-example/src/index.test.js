import debug from './debug';

debug('test');
debug({...{foo: 'bar'}});

describe('test', () => {
  it('should return true', () => {
    expect(true).toEqual(true);
  });
});
