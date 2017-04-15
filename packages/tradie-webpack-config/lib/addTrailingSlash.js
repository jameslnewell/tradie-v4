module.exports = path => {
  if (typeof path !== 'string' || path.length === 0) {
    return '/';
  }

  if (path[path.length - 1] !== '/') {
    return `${path}/`;
  }

  return path;
};
