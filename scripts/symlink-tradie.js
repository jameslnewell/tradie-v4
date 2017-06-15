/*

  `tradie` is dog-fooding itself. That means `tradie` is built using a 
    previously published version of `tradie-template-node-package`.
    
  This script symlinks the `tradie` CLI from the previously published 
    version of `tradie-template-node-package` in the root dir into each
    package that does not end in `-example` (these are for testing the 
    current dev version of `tradie`).

*/

const path = require('path');
const fs = require('fs-extra');
const finder = require('finder-on-steroids');

const TEMPLATE_NAME = 'tradie-template-node-package';

/**
 * Get the installed version of the `tradie` template
 * @returns {string}
 */
function getInstalledVersion() {
  const metadata = require(`../node_modules/${TEMPLATE_NAME}/package.json`);
  return metadata && metadata.version;
}

/**
 * List the `package.json` files of `tradie` packages which need to be 
 *  built using a previous version of `tradie`.
 * @returns {Promise.<string[]>}
 */
function listPackageJSONFiles() {
  return finder(process.cwd())
    .files()
    .depth(3)
    .path('packages/*/package.json')
    .filter(path => !/-example\//.test(path))
    .filter(path => {
      const packageMetadata = require(path);
      return (
        packageMetadata.devDependencies &&
        packageMetadata.devDependencies[TEMPLATE_NAME]
      );
    })
    .find();
}

const version = getInstalledVersion();
console.log(
  `Symlinking the installed version of "${TEMPLATE_NAME}@${version}" to packages:`
);
console.log();
listPackageJSONFiles()
  .then(files =>
    Promise.all(
      files.map(file => {
        //symlink the tradie bin
        const name = path.basename(path.dirname(file));
        const cwd = process.cwd();
        const src = path.resolve(__dirname, '../node_modules/.bin/tradie');
        const dest = `${path.dirname(file)}/node_modules/.bin/tradie`;
        console.log(
          `  ${name}: \n    ./${path.relative(cwd, src)} => ./${path.relative(
            cwd,
            dest
          )}\n`
        );

        try {
          return fs
            .ensureDir(path.dirname(dest))
            .then(() => fs.remove(dest))
            .then(() => fs.ensureSymlink(src, dest));
        } catch (error) {
          console.error(error);
        }
      })
    )
  )
  .catch(error => console.log(error));
