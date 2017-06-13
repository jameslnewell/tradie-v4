'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var resolveModule = require('resolve');
var Scripts = require('./Scripts');

var REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-template-[a-zA-Z0-9.-]+$/;

var Template = function () {
  function Template(name, directory) {
    _classCallCheck(this, Template);

    this._name = name;
    this._directory = directory;
  }

  _createClass(Template, [{
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
    key: 'getConfig',
    value: function getConfig(script, args) {
      var _this2 = this;

      return this.require(`./config/${script}`).then(function (module) {

        if (typeof module === 'function') {
          return module(args);
        }

        if (typeof module === 'object') {
          return module;
        }

        throw new Error(`tradie: Config "${_this2.name}/config/${script}" did not return a config object or function.`);
      });
    }
  }, {
    key: 'getScripts',
    value: function getScripts() {
      return Scripts.find(this);
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

  return Template;
}();

Template.find = function () {
  return new Promise(function (resolve, reject) {
    var rootPath = process.cwd();
    var packageMetadata = require(path.join(rootPath, 'package.json'));
    var packageDependencies = Object.keys(packageMetadata.devDependencies || {});
    var templatePackages = packageDependencies.filter(function (name) {
      return REGEXP.test(name);
    });

    if (templatePackages.length === 0) {
      return reject(new Error(`tradie: No template found in \`devDependencies\` in \`package.json\`. Please install a template e.g. \`npm install --save tradie-template-default\`.`));
    }

    if (templatePackages.length > 1) {
      return reject(new Error(`tradie: More than one template found in \`devDependencies\` in \`package.json\`. Please uninstall extraneous templates e.g. \`npm uninstall tradie-template-default\`.`));
    }

    var name = templatePackages[0];

    resolveModule(`${name}/package.json`, { basedir: rootPath }, function (error, file) {
      if (error) {
        reject(error);
      } else {
        var directory = path.dirname(file);
        resolve(new Template(name, directory));
      }
    });
  });
};

module.exports = Template;