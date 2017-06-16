import path from 'path';
import resolveModule from 'resolve';
import Scripts from './Scripts';

const REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-template-[a-zA-Z0-9.-]+$/;

export default class Template {
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
    return this.resolve(module).then(file => require(file)); //TODO: handle transpiled modules from templates
  }

  getConfig(script, args) {
    return this.require(`./config/${script}`).then(module => {
      if (typeof module === 'function') {
        return module(args);
      }

      if (typeof module === 'object') {
        return module;
      }

      throw new Error(
        `tradie: Config "${this
          .name}/config/${script}" did not return a config object or function.`
      );
    });
  }

  getScripts() {
    return Scripts.find(this);
  }
}

Template.find = function() {
  return new Promise((resolve, reject) => {
    const rootPath = process.cwd();
    const packageMetadata = require(path.join(rootPath, 'package.json'));
    const packageDependencies = Object.keys(
      packageMetadata.devDependencies || {}
    );
    const templatePackages = packageDependencies.filter(name =>
      REGEXP.test(name)
    );

    if (templatePackages.length === 0) {
      reject(
        new Error(
          `tradie: No template found in \`devDependencies\` in \`package.json\`. Please install a template e.g. \`npm install --save tradie-template-default\`.`
        )
      );
      return;
    }

    if (templatePackages.length > 1) {
      reject(
        new Error(
          `tradie: More than one template found in \`devDependencies\` in \`package.json\`. Please uninstall extraneous templates e.g. \`npm uninstall tradie-template-default\`.`
        )
      );
      return;
    }

    const name = templatePackages[0];

    resolveModule(
      `${name}/package.json`,
      {basedir: rootPath},
      (error, file) => {
        if (error) {
          reject(error);
        } else {
          const directory = path.dirname(file);
          resolve(new Template(name, directory));
        }
      }
    );
  });
};
