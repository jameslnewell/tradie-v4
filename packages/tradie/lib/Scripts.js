const path = require('path');
const resolveModule = require('resolve');

const REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-scripts-[a-zA-Z0-9.-]+$/;

class Scripts {
  constructor(name, directory) {
    this._name = name;
    this._directory = directory;
  }

  get name() {
    return this._name;
  }

  get directory() {
    return this._directory;
  }

  resolve(module) {
    return new Promise((resolve, reject) => {
      resolveModule(module, {basedir: this.directory}, (error, path) => {
        if (error) {
          reject(error);
        } else {
          resolve(path);
        }
      });
    });
  }

  require(module) {
    return this.resolve(module).then(path => require(path)); //TODO: handle transpiled modules
  }

  describe(yargs) {
    return this.require(`./describe`).then(
      module => {
        if (typeof module !== 'function') {
          throw new Error(`tradie: "${this.name}/describe" is not a function`);
        }

        module(yargs);
      },
      error => {}
    );
  }

  run(script, config) {
    return this.require(`./scripts/${script}`).then(module => module(config));
  }
}

Scripts.find = function(template) {
  return new Promise((resolve, reject) => {
    template
      .require('./package.json')
      .then(json => {
        const dependencies = Object.keys(json.dependencies || {});
        const packages = dependencies.filter(name => REGEXP.test(name));

        if (packages.length === 0) {
          return reject(
            new Error(
              `tradie: No scripts found in \`dependencies\` in \`${templatePackagePath}\`. Please ask the maintainer to install scripts e.g. \`npm install --save tradie-scripts-default\`.`
            )
          );
        }

        if (packages.length > 1) {
          return reject(
            new Error(
              `tradie: More than one scripts found in \`dependencies\` in \`${templatePackagePath}\`. Please ask the maintainer to uninstall extraneous scripts e.g. \`npm uninstall tradie-scripts-default\`.`
            )
          );
        }

        const name = packages[0];

        resolveModule(
          `${name}/package.json`,
          {basedir: template.directory},
          (error, file) => {
            if (error) {
              reject(error);
            } else {
              const directory = path.dirname(file);
              resolve(new Scripts(name, directory));
            }
          }
        );
      })
      .catch(reject);
  });
};

module.exports = Scripts;
