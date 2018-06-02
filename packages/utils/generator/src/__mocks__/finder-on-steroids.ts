import finder = require('finder-on-steroids');

let mockFiles: string[] = [];

function createMockFinder(dir: string): finder.Finder {
  const mockFinder = finder(dir);
  mockFinder.find = () => Promise.resolve(mockFiles);
  return mockFinder;
}

(createMockFinder as any).__setFiles = (files: string[]) => {
  mockFiles = files;
};

export default createMockFinder;
