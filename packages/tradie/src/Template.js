import path from 'path';
import resolveModule from 'resolve';
import Scripts from './Scripts';

const TEMPLATE_NAME_REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-template-[a-zA-Z0-9.-]+$/;

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
    return this.resolveModule(module).then(file => import(file)); //TODO: handle transpiled modules from templates
  }

  getConfig(script, args) {
    return this.requireModule(`./lib/${script}`).then(module => {
      if (module.__esModule) {
        module = module.default; //eslint-disable-line no-param-reassign
      }

      if (typeof module !== 'function') {
        throw new Error(
          `tradie: Config "${this
            .name}/lib/${script}" did not return a function for creating the config.`
        );
      }

      return module(args);
    });
  }

  getScripts() {
    return Scripts.find(this);
  }
}

Template.find = function() {
  const projectDirectory = process.cwd();
  return import(
    path.join(projectDirectory, 'package.json')
  ).then(projectMetadata => {
    //this is used so we can dogfood tradie, using the previous version to run the build,
    //rather than lerna symlinking the latest version
    let templateName = projectMetadata['tradie-template'];

    if (!templateName) {
      const projectDependencies = Object.keys(
        projectMetadata.devDependencies || {}
      );
      const templateNames = projectDependencies.filter(name =>
        TEMPLATE_NAME_REGEXP.test(name)
      );

      if (templateNames.length === 0) {
        return Promise.reject(
          // new Error( //FIXME: https://github.com/facebook/jest/issues/3699
          `tradie: No template found in \`devDependencies\` in \`package.json\`. Please install a template e.g. \`npm install --save tradie-template-default\`.`
          // )
        );
      }

      if (templateNames.length > 1) {
        return Promise.reject(
          // new Error( //FIXME: https://github.com/facebook/jest/issues/3699
          `tradie: More than one template found in \`devDependencies\` in \`package.json\`. Please uninstall extraneous templates e.g. \`npm uninstall tradie-template-default\`.`
          // )
        );
      }

      templateName = templateNames[0];
    }

    return new Promise((resolve, reject) => {
      resolveModule(
        `${templateName}/package.json`,
        {basedir: projectDirectory},
        (resolveError, file) => {
          if (resolveError) {
            reject(resolveError);
          } else {
            const templateDirectory = path.dirname(file);
            resolve(new Template(templateName, templateDirectory));
          }
        }
      );
    });
  });
};
