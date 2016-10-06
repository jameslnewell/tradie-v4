const isClientBundle = require('./../../../../../tradie/packages/tradie-template-default/config/lib/isClientBundle');

describe('isClientBundle()', () => {

  it('should return true WHEN the file name is not server', () => {
    expect(isClientBundle('./index.js')).to.be.true;
    expect(isClientBundle('./client/index.js')).to.be.true;
  });

  it('should return false WHEN the file name is server', () => {
    expect(isClientBundle('./server.js')).to.be.false;
    expect(isClientBundle('./client/server.js')).to.be.false;
  });

});
