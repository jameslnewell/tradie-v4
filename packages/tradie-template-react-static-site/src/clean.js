import getPaths from './utils/getPaths';

export default options => {
  const paths = getPaths(options.root);
  return {
    globs: [paths.dest, paths.tmp]
  };
};
