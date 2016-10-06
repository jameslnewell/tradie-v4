'use strict';
const findTemplatePackage = require('./findTemplatePackage');

module.exports = (module, defaultExport) => findTemplatePackage(process.cwd())
  .then(template => {
    //FIXME: return default export if OK
    try {
      return require(`${template}/${module}`);
    } catch (e) {
      console.error(`Failed to require "${template}/${module}"`);
      throw e;
      return defaultExport;
    }
  })
;