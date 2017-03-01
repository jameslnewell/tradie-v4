
module.exports = {
  clean: options => require('./lib/clean')(options),
  build: options => require('./lib/build')(options),
  serve: options => require('./lib/serve')(options),
  test: options => require('./lib/test')(options)
};