const fs = require('fs');
const path = require('path');

module.exports = function({root}) {
  const flowConfigFile = path.resolve(root, '.flowconfig');
  return fs.existsSync(flowConfigFile);
};
