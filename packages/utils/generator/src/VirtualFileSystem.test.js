import VirtualFileSystem from './VirtualFileSystem';

describe('vfs', () => {
  describe('.read()', () => {
    it('should throw when contents has not been written', () => {
      const vfs = new VirtualFileSystem();
      expect(() => vfs.read('foobar.txt')).toThrow();
    });

    it('should throw when the file has been deleted', () => {
      const vfs = new VirtualFileSystem();
      vfs.write('foobar.txt', 'Hello World!');
      vfs.delete('foobar.txt');
      expect(() => vfs.read('foobar.txt')).toThrow();
    });

    it('should return the contents when contents has been written', () => {
      const vfs = new VirtualFileSystem();
      vfs.write('foobar.txt', 'Hello World!');
      expect(vfs.read('foobar.txt')).toEqual('Hello World!');
    });

    it('should return the most recent contents when contents has been written multiple times ', () => {
      const vfs = new VirtualFileSystem();
      vfs.write('foobar.txt', 'Hello Universe!');
      vfs.write('foobar.txt', 'Hello Earthlings!');
      expect(vfs.read('foobar.txt')).toEqual('Hello Earthlings!');
    });
  });

  describe('.writeJSON()', () => {
    it('should stringify the contents', () => {
      const vfs = new VirtualFileSystem();
      vfs.writeJSON('package.json', {name: 'James'});
      expect(vfs.read('package.json')).toEqual('{\n  "name": "James"\n}');
    });
  });
});
