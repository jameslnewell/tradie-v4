import finder from 'finder-on-steroids';

let mockFiles = [];

export default function createMockFinder(dir) {
  const mockFinder = finder(dir);
  mockFinder.find = () => Promise.resolve(mockFiles);
  return mockFinder;
}

createMockFinder.__setFiles = files => {
  mockFiles = files;
};
