module.exports = {
  clean: options => require('./lib/clean')(options), //eslint-disable-line global-require
  build: options => require('./lib/build')(options), //eslint-disable-line global-require
  serve: options => require('./lib/serve')(options), //eslint-disable-line global-require
  test: options => require('./lib/test')(options) //eslint-disable-line global-require
};
