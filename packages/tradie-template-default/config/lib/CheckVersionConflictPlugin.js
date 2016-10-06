'use strict';
const path = require('path');
const findAndReadPackageJson = require('find-and-read-package-json');

const transform = json => ({
  name: json.name,
  version: json.version
});

const getPackageVersions = files => {
  const versions = {};
  const findAndReadPackageJsonOptions = {cache: {}, transform};

  return Promise.all(files.map(file => {
    return findAndReadPackageJson(path.dirname(file), findAndReadPackageJsonOptions)
      .then(json => {

        //add the version to the list if it is not already listed
        if (versions[json.name]) {
          if (versions[json.name].indexOf(json.version) === -1) {
            versions[json.name].push(json.version);
          }
        } else {
          versions[json.name] = [json.version];
        }

      })
      .catch(() => {/*do nothing*/})
      ;
  }))
    .then(() => versions)
    ;
};

class CheckVersionConflictPlugin {

  constructor(options) {
    this.options = options || {};

    //convert `include` regex to a filter fn
    if (this.options.include instanceof RegExp) {
      const regexp = this.options.include;
      this.options.include = file => regexp.test(file);
    }

    //convert `exclude` regex to a filter fn
    if (this.options.exclude instanceof RegExp) {
      const regexp = this.options.exclude;
      this.options.exclude = file => regexp.test(file);
    }

  }

  apply(compiler) {

    compiler.plugin('after-emit', (compilation, callback) => {
      const files = [];

      //get a list of all the files used
      compilation.modules.forEach(module => {
        if (module.fileDependencies) {
          module.fileDependencies.forEach(file => {

            //allow the user to whitelist the file in the check
            if (this.options && typeof this.options.include === 'function' && !this.options.include(file)) {
              return false;
            }

            //allow the user to blacklist the file in the check
            if (this.options && typeof this.options.exclude === 'function' && this.options.exclude(file)) {
              return false;
            }

            //add the file
            files.push(file);

          });
        }
      });

      //check for conflicting versions of the packages used
      // console.log(files);
      getPackageVersions(files)
        .then(versions => {
          Object.keys(versions).forEach(name => {
            if (versions[name].length > 1) {
              compilation.errors.push(`Conflicting versions of "${name}" were bundled (${versions[name].join(', ')})`);
            }
          });
        })
        .then(callback, callback)
      ;

    });

  }

}

module.exports = CheckVersionConflictPlugin;