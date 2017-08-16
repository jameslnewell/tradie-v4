import isScriptsName from './isScriptsName';

describe('isScriptsName()', () => {
  it('should return true for scripts with the @tradie prefix and -scripts suffix', () => {
    expect(isScriptsName('@tradie/node-package-scripts')).toBeTruthy();
  });

  it('should return true for scripts with the @foobar prefix and -scripts suffix', () => {
    expect(isScriptsName('@foobar/node-package-scripts')).toBeTruthy();
  });

  it('should return false for scripts without the @org prefix', () => {
    expect(isScriptsName('node-package-scripts')).toBeFalsy();
  });

  it('should return false for scripts without the -scripts suffix', () => {
    expect(isScriptsName('@tradie/node-package')).toBeFalsy();
  });

  it('should return false for random packages', () => {
    expect(isScriptsName('resolve')).toBeFalsy();
    expect(isScriptsName('finder-on-steroids')).toBeFalsy();
  });
});
