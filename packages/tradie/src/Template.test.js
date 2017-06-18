jest.mock('resolve');
import path from 'path';
import resolve from 'resolve';
import Template from './Template';

const mockRequire = (() => {
  let throws = false;
  let returns = {};

  const fn = module => {
    if (throws) {
      throw `Cannot find module`; //FIXME: https://github.com/facebook/jest/issues/3699
    }
    return returns;
  };

  fn.throws = () => {
    throws = true;
    returns = null;
  };

  fn.returns = (val = {}) => {
    throws = false;
    returns = val;
  };

  return fn;
})();

describe('Template', () => {
  describe('.find()', () => {
    const packagePath = path.join(process.cwd(), 'package.json');

    jest.mock(packagePath, mockRequire);

    beforeEach(() => {
      //reset modules because the package.json module gets cached across test runs
      jest.resetModules();
    });

    it('should reject with an error when the project does not have a package.json', () => {
      expect.hasAssertions();
      mockRequire.throws();
      return expect(Template.find()).rejects.toMatch('Cannot find module');
    });

    it('should reject with an error when there are no templates listed as dependencies in the project', () => {
      expect.hasAssertions();
      mockRequire.returns();
      return expect(Template.find()).rejects.toMatch('No template found');
    });

    it('should reject with an error when there are multiple templates listed as dependencies in the project', () => {
      expect.hasAssertions();
      mockRequire.returns({
        devDependencies: {
          'tradie-template-foo': '^1.2.3', //TODO: test `@user` prefix too
          'tradie-template-bar': '^1.2.3'
        }
      });
      return expect(Template.find()).rejects.toMatch(
        'More than one template found'
      );
    });

    it('should reject with an error when the template package.json cannot be found', () => {
      expect.hasAssertions();
      mockRequire.returns({
        devDependencies: {
          'tradie-template-foo': '^1.2.3' //TODO: test `@user` prefix too
        }
      });
      resolve.mock("Cannot find module 'tradie-template-foo/package.json'");
      return expect(Template.find()).rejects.toMatch(
        "Cannot find module 'tradie-template-foo/package.json'"
      );
    });

    it('should resolve with a template when the project lists a single template as a dependency, and the template can be located', () => {
      expect.hasAssertions();
      mockRequire.returns({
        devDependencies: {
          'tradie-template-foo': '^1.2.3' //TODO: test `@user` prefix too
        }
      });
      resolve.mock(null, '/foo/bar/tradie-template-foo/package.json');
      return Template.find().then(template => {
        expect(template).toEqual(expect.any(Template));
        expect(template.name).toEqual('tradie-template-foo');
        expect(template.directory).toEqual('/foo/bar/tradie-template-foo');
      });
    });
  });
});
