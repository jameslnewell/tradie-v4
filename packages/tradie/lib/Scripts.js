'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var resolveModule = require('resolve');

var REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-scripts-[a-zA-Z0-9.-]+$/;

var Scripts = function () {
  function Scripts(name, directory) {
    _classCallCheck(this, Scripts);

    this._name = name;
    this._directory = directory;
  }

  _createClass(Scripts, [{
    key: 'resolve',
    value: function resolve(module) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        resolveModule(module, { basedir: _this.directory }, function (error, path) {
          if (error) {
            reject(error);
          } else {
            resolve(path);
          }
        });
      });
    }
  }, {
    key: 'require',
    value: function (_require) {
      function require(_x) {
        return _require.apply(this, arguments);
      }

      require.toString = function () {
        return _require.toString();
      };

      return require;
    }(function (module) {
      return this.resolve(module).then(function (path) {
        return require(path);
      }); //TODO: handle transpiled modules
    })
  }, {
    key: 'describe',
    value: function describe(yargs) {
      var _this2 = this;

      return this.require(`./cli`).then(function (module) {
        if (typeof module !== 'function') {
          throw new Error(`tradie: "${_this2.name}/cli" is not a function`);
        }

        module(yargs);
      }, function (error) {});
    }
  }, {
    key: 'run',
    value: function run(script, config) {
      return this.require(`./scripts/${script}`).then(function (module) {
        return module(config);
      });
    }
  }, {
    key: 'name',
    get: function get() {
      return this._name;
    }
  }, {
    key: 'directory',
    get: function get() {
      return this._directory;
    }
  }]);

  return Scripts;
}();

Scripts.find = function (template) {
  return new Promise(function (resolve, reject) {
    template.require('./package.json').then(function (packageMetadata) {
      var packageDependencies = Object.keys(packageMetadata.dependencies || {});
      var scriptPackages = packageDependencies.filter(function (name) {
        return REGEXP.test(name);
      });

      if (scriptPackages.length === 0) {
        return reject(new Error(`tradie: No scripts found in \`dependencies\` in \`${templatePackagePath}\`. Please ask the maintainer to install scripts e.g. \`npm install --save tradie-scripts-default\`.`));
      }

      if (scriptPackages.length > 1) {
        return reject(new Error(`tradie: More than one scripts found in \`dependencies\` in \`${templatePackagePath}\`. Please ask the maintainer to uninstall extraneous scripts e.g. \`npm uninstall tradie-scripts-default\`.`));
      }

      var name = scriptPackages[0];

      resolveModule(`${name}/package.json`, { basedir: template.directory }, function (error, file) {
        if (error) {
          reject(error);
        } else {
          var directory = path.dirname(file);
          resolve(new Scripts(name, directory));
        }
      });
    }).catch(reject);
  });
};

module.exports = Scripts;