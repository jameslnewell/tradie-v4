import path from 'path';
import fs from 'fs-extra';
import finder from 'finder-on-steroids';
import {read, diff, apply} from './misc';

describe('read()', () => {
  it('should list files', () => {
    finder.__setFiles([
      '/foo/bar/package.json',
      '/foo/bar/src/index.js',
      '/foo/bar/src/index.test.js'
    ]);

    fs.__files = {
      '/foo/bar/package.json': 'a',
      '/foo/bar/src/index.js': 'b',
      '/foo/bar/src/index.test.js': 'c'
    };

    return expect(read('/foo/bar/')).resolves.toMatchObject({
      'package.json': {contents: new Buffer('a')},
      'src/index.js': {contents: new Buffer('b')},
      'src/index.test.js': {contents: new Buffer('c')}
    });
  });
});

describe('diff()', () => {
  it('should highlight added files', () => {
    const oldFiles = {};
    const newFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    expect(diff(oldFiles, newFiles)).toEqual({
      'foobar.txt': 'A'
    });
  });

  it('should highlight modified files', () => {
    const oldFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    const newFiles = {
      'foobar.txt': {
        contents: 'Hello Earthlings!'
      }
    };
    expect(diff(oldFiles, newFiles)).toEqual({
      'foobar.txt': 'M'
    });
  });

  it('should highlight deleted files', () => {
    const oldFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    const newFiles = {};
    expect(diff(oldFiles, newFiles)).toEqual({
      'foobar.txt': 'D'
    });
  });

  it('should not highlight unchanged files', () => {
    const oldFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    const newFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    expect(diff(oldFiles, newFiles)).toEqual({});
  });

  it('should highlight modified files when changed() returns true', () => {
    const oldFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    const newFiles = {
      'foobar.txt': {
        contents: 'Hello Earthlings!'
      }
    };
    expect(diff(oldFiles, newFiles, {changed: () => true})).toEqual({
      'foobar.txt': 'M'
    });
  });

  it('should not highlight modified files when changed() returns false', () => {
    const oldFiles = {
      'foobar.txt': {
        contents: 'Hello World!'
      }
    };
    const newFiles = {
      'foobar.txt': {
        contents: 'Hello Earthlings!'
      }
    };
    expect(diff(oldFiles, newFiles, {changed: () => false})).toEqual({});
  });
});

describe('apply()', () => {
  it('should write added files', () => {
    fs.__files = {};
    const statuses = {
      'package.json': 'A'
    };
    const newFiles = {
      'package.json': {
        contents: 'A'
      }
    };
    return apply('/foo/bar/', statuses, newFiles).then(() => {
      expect(fs.__files).toEqual({
        '/foo/bar/package.json': 'A'
      });
    });
  });

  it('should write modified files', () => {
    fs.__files = {
      '/foo/bar/package.json': 'A'
    };
    const statuses = {
      'package.json': 'M'
    };
    const newFiles = {
      'package.json': {
        contents: 'B'
      }
    };
    return apply('/foo/bar/', statuses, newFiles).then(() => {
      expect(fs.__files).toEqual({
        '/foo/bar/package.json': 'B'
      });
    });
  });

  it('should unlink deleted files', () => {
    fs.__files = {
      '/foo/bar/package.json': 'A'
    };
    const statuses = {
      'package.json': 'D'
    };
    const newFiles = {};
    return apply('/foo/bar/', statuses, newFiles).then(() => {
      expect(fs.__files).toEqual({});
    });
  });
});

read('.').then(files => {
  //clone files
  const extend = require('extend');
  const oldFiles = extend({}, files);
  const newFiles = extend({}, files);

  newFiles['package.json'] = {contents: '{}'};
  newFiles['src/index.js'] = {contents: 'export default function(...args) {}'};
  newFiles['src/index.test.js'] = {contents: "import sum from '.';"};

  const statuses = diff(oldFiles, newFiles);

  Object.keys(statuses).forEach(filePath => {
    console.log(statuses[filePath], filePath);
  });
});
