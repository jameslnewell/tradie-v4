const imports = require('jscodeshift-imports');

module.exports = function(file, api) {
  const {jscodeshift} = api;
  const {statement} = jscodeshift.template;

  imports.register(jscodeshift, imports.config.CJSBasicRequire);

  return jscodeshift(file.source).toSource();
};
