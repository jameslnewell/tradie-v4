'use strict';
const findTemplatePackage = require('./findTemplatePackage');

module.exports = (module, defaultExport) => findTemplatePackage(process.cwd())
  .then(template => {
    try {
      return require(`${template}/${module}`);
    } catch (e) {
      return defaultExport;
    }
  })
;