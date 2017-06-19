const jestify = require('tradie-utils-jest').default;

module.exports = function(options) {
  return jestify(options.jest); //TODO: linting and type checking
};
