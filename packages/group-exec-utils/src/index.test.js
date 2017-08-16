//@flow
import path from 'path';
import Group from '.';

describe('GroupExecutor', () => {
  describe('.exec()', () => {
    it('should be passed the matching context when called with a *.css file', () => {
      expect.assertions(1);

      const group = new Group(
        ({include}) => ({extension: path.extname(String(include))}),
        [{include: '**/*.html'}, {include: '**/*.css'}, {include: '**/*.js'}]
      );

      return group.exec('foo/bar.html', (file, context) => {
        expect(context.extension).toEqual('.html');
      });
    });

    it('should be passed the matching context when called with a *.css file', () => {
      expect.assertions(1);

      const group = new Group(
        ({include}) => ({extension: path.extname(String(include))}),
        [{include: '**/*.html'}, {include: '**/*.css'}, {include: '**/*.js'}]
      );

      return group.exec('foo/bar.css', (file, context) => {
        expect(context.extension).toEqual('.css');
      });
    });

    it('should be passed the matching context when called with a *.js file', () => {
      expect.assertions(1);

      const group = new Group(
        ({include}) => ({extension: path.extname(String(include))}),
        [{include: '**/*.html'}, {include: '**/*.css'}, {include: '**/*.js'}]
      );

      return group.exec('foo/bar.js', (file, context) => {
        expect(context.extension).toEqual('.js');
      });
    });
  });
});
