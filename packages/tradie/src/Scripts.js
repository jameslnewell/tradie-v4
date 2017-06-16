import path from 'path';
import resolveModule from 'resolve';

const REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-scripts-[a-zA-Z0-9.-]+$/;

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

  resolve(module) {
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

  require(module) {
    return this.resolve(module).then(file => require(file)); //TODO: handle transpiled modules
  }

  describe(yargs) {
    return this.require(`./cli`).then(
      module => {
        if (typeof module !== 'function') {
          throw new Error(`tradie: "${this.name}/cli" is not a function`);
        }

        module(yargs);
      },
      () => {}
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
      .then(packageMetadata => {
        const packageDependencies = Object.keys(
          packageMetadata.dependencies || {}
        );
        const scriptPackages = packageDependencies.filter(name =>
          REGEXP.test(name)
        );

        if (scriptPackages.length === 0) {
          reject(
            new Error(
              `tradie: No scripts found in \`dependencies\` in \`${template}\`. Please ask the maintainer to install scripts e.g. \`npm install --save tradie-scripts-default\`.`
            )
          );
          return;
        }

        if (scriptPackages.length > 1) {
          reject(
            new Error(
              `tradie: More than one scripts found in \`dependencies\` in \`${template}\`. Please ask the maintainer to uninstall extraneous scripts e.g. \`npm uninstall tradie-scripts-default\`.`
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
