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
    .filter(path => {
      const packageMetadata = require(path);
      return (
        packageMetadata['tradie-template'] === TEMPLATE_NAME ||
        (packageMetadata.devDependencies &&
          packageMetadata.devDependencies[TEMPLATE_NAME])
      );
    })
    .find();
}

function symlinkBinary(fromDir, toDir) {
  const cwd = process.cwd();
  const pkg = path.basename(toDir);

  const fromBin = path.join(
    fromDir,
    'node_modules',
    'tradie',
    'lib',
    'tradie.js'
  );
  const toBin = path.join(toDir, 'node_modules', '.bin', 'tradie');

  const fromBinRel = path.relative(cwd, fromBin);
  const toBinRel = path.relative(cwd, toBin);

  console.log(`  ${pkg}: \n    ./${fromBinRel} => ./${toBinRel}\n`);

  return fs
    .ensureDir(path.dirname(toBin))
    .then(() => fs.remove(toBin))
    .then(() => fs.ensureSymlink(fromBin, toBin))
    .catch(err => {
      console.log(pkg, err);
      console.log(fromBin, fs.existsSync(fromBin));
      console.log(toBin, fs.existsSync(toBin));
    });
}

function symlinkInstalledBinary(pkgDir) {
  const rootDir = path.join(__dirname, '..');
  return symlinkBinary(rootDir, pkgDir);
}

function symlinkCurrentBinary(pkgDir) {
  const tplDir = path.join(__dirname, '..', 'packages', TEMPLATE_NAME);
  return symlinkBinary(tplDir, pkgDir);
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
        const pkgname = require(file).name;

        if (/example/.test(pkgname)) {
          return symlinkCurrentBinary(path.dirname(file));
        }

        return symlinkInstalledBinary(path.dirname(file));
      })
    )
  )
  .catch(error => console.log(error));
