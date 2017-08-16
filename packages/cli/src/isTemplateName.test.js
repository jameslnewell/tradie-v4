import isTemplateName from './isTemplateName';

describe('isTemplateName()', () => {
  it('should return true for a template with the @tradie prefix and -template suffix', () => {
    expect(isTemplateName('@tradie/node-package-template')).toBeTruthy();
  });

  it('should return true for a template with the @foobar prefix and -template suffix', () => {
    expect(isTemplateName('@foobar/node-package-template')).toBeTruthy();
  });

  it('should return false for a template without the @org prefix', () => {
    expect(isTemplateName('node-package-template')).toBeFalsy();
  });

  it('should return false for a template without the -template suffix', () => {
    expect(isTemplateName('@tradie/node-package')).toBeFalsy();
  });

  it('should return false for random packages', () => {
    expect(isTemplateName('resolve')).toBeFalsy();
    expect(isTemplateName('finder-on-steroids')).toBeFalsy();
  });
});
