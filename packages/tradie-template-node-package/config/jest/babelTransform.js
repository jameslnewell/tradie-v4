const jestUtils = require('tradie-utils-jest');
const getBabelConfig = require('../lib/getBabelConfig');

module.exports = jestUtils.createBabelTransform(
  Object.assign({}, getBabelConfig({root: process.cwd()}), {
    //FIXME: root
    retainLines: true,
    sourceMaps: 'inline'
  })
);
