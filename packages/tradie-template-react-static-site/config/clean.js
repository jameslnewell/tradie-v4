const getPaths = require('./lib/getPaths');

module.exports = options => {
  const paths = getPaths(options.root);
  return {
    globs: [paths.dest, paths.tmp]
  };
};
