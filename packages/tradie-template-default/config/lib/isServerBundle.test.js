const isServerBundle = require('./isServerBundle');

describe('isServerBundle()', () => {

  it('should return true WHEN the file name is server', () => {
    expect(isServerBundle('./server.js')).to.be.true;
    expect(isServerBundle('./server/server.js')).to.be.true;
  });

  it('should return false WHEN the file name is not server', () => {
    expect(isServerBundle('./index.js')).to.be.false;
    expect(isServerBundle('./client/index.js')).to.be.false;
  });

});
