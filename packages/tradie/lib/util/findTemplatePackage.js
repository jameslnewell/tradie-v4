'use strict';
const findAndReadPackageJson = require('find-and-read-package-json');

const PACKAGE_CACHE = {};
const TEMPLATE_NAME_REGEXP = /^(@[a-zA-Z0-9.-]+\/)?tradie-template-[a-zA-Z0-9.-]+$/;

class NoTemplateError extends Error {
  constructor() {
    super(
      `tradie: No template found in \`devDependencies\` in \`package.json\`. Please install a template e.g. \`npm install --save tradie-template-default\`.`
    );
    this.name = this.constructor.name;
  }
}

class MultipleTemplatesError extends Error {
  constructor() {
    super(
      `tradie: More than one template found in \`devDependencies\` in \`package.json\`. Please uninstall a template e.g. \`npm uninstall tradie-template-default\`.`
    );
    this.name = this.constructor.name;
  }
}

module.exports = dir =>
  findAndReadPackageJson(dir, {
    cache: PACKAGE_CACHE,
    transform: json => json.devDependencies
  }).then(devDependencies => {
    //TODO: move cache to a higher level
    if (typeof devDependencies !== 'object') {
      throw new NoTemplateError();
    }

    const templates = Object.keys(devDependencies).filter(name =>
      TEMPLATE_NAME_REGEXP.test(name)
    );

    if (templates.length < 1) {
      throw new NoTemplateError();
    }

    if (templates.length > 1) {
      throw new MultipleTemplatesError();
    }

    return templates[0];
  });
