'use strict';
const findTemplatePackage = require('./findTemplatePackage');

module.exports = (module /* , defaultExport */) =>
  findTemplatePackage(process.cwd()).then(template => {
    //FIXME: return default export if OK
    try {
      return require(`${template}/${module}`); //eslint-disable-line global-require
    } catch (e) {
      console.error(`Failed to require "${template}/${module}"`); //eslint-disable-line no-console
      throw e; //return defaultExport
    }
  });
