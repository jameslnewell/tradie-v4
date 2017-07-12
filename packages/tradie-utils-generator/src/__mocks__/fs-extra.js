const fs = jest.genMockFromModule('fs-extra');

fs.__files = {};

fs.ensureDir = jest.fn().mockReturnValue(Promise.resolve());

fs.unlink = jest.fn(file => {
  delete fs.__files[file];
  return Promise.resolve();
});

fs.readFile = jest.fn(file => {
  if (typeof fs.__files[file] === undefined) {
    return Promise.reject(new Error(`File "${file}" not found.`));
  }
  return Promise.resolve(new Buffer(fs.__files[file]));
});

fs.writeFile = jest.fn((file, contents) => {
  fs.__files[file] = Buffer.isBuffer(contents) ? contents.toString() : contents;
  return Promise.resolve();
});

export default fs;
