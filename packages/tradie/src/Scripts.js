import path from 'path';
import resolveModule from 'resolve';

const SCRIPT_NAME_REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-scripts-[a-zA-Z0-9.-]+$/;

export default class Scripts {
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

  resolveModule(module) {
    return new Promise((resolve, reject) => {
      resolveModule(module, {basedir: this.directory}, (error, file) => {
        if (error) {
          reject(error);
        } else {
          resolve(file);
        }
      });
    });
  }

  requireModule(module) {
    return this.resolveModule(module).then(file => import(file)); //TODO: handle transpiled modules
  }

  describe(yargs) {
    return this.requireModule(`./lib/__args__`).then(
      module => {
        if (module.__esModule) {
          module = module.default; //eslint-disable-line no-param-reassign
        }

        if (typeof module !== 'function') {
          throw new Error(`tradie: "${this.name}/_args_" is not a function`);
        }

        module(yargs);
      },
      () => {}
    );
  }

  run(script, config) {
    return this.requireModule(`./lib/${script}`).then(module => {
      if (module.__esModule) {
        module = module.default; //eslint-disable-line no-param-reassign
      }

      if (typeof module !== 'function') {
        throw new Error(
          `tradie: Script "${this
            .name}/lib/${script}" did not return a function for running the command.`
        );
      }

      return module(config);
    });
  }
}

Scripts.find = function(template) {
  return new Promise((resolve, reject) => {
    template
      .requireModule('./package.json')
      .then(packageMetadata => {
        const packageDependencies = Object.keys(
          packageMetadata.dependencies || {}
        );
        const scriptPackages = packageDependencies.filter(name =>
          SCRIPT_NAME_REGEXP.test(name)
        );

        if (scriptPackages.length === 0) {
          reject(
            new Error(
              `tradie: No scripts found in \`dependencies\` in \`${template.name}\`. Please ask the maintainer to install scripts e.g. \`npm install --save tradie-scripts-default\`.`
            )
          );
          return;
        }

        if (scriptPackages.length > 1) {
          reject(
            new Error(
              `tradie: More than one scripts found in \`dependencies\` in \`${template.name}\`. Please ask the maintainer to uninstall extraneous scripts e.g. \`npm uninstall tradie-scripts-default\`.`
            )
          );
          return;
        }

        const name = scriptPackages[0];

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
