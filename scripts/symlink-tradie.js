const path = require('path');
const fs = require('fs-extra');
const resolve = require('resolve');
const finder = require('finder-on-steroids');

const INSTALLED_TEMPLATE_NAME = '@tradie/node-package-scripts';

/**
 * Get the installed version of the `tradie` template
 * @returns {string}
 */
function getInstalledVersion() {
  const metadata = require(`../node_modules/${INSTALLED_TEMPLATE_NAME}/package.json`);
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
    .find();
}

function symlinkBinary(fromFile, toFile) {
  //log file info
  const cwd = process.cwd();
  const relFromFile = path.relative(cwd, fromFile);
  const relToFile = path.relative(cwd, toFile);
  console.log(`    ./${relFromFile} => ./${relToFile}\n`);

  //symlink the file
  return fs
    .ensureDir(path.dirname(toFile))
    .then(() => fs.remove(toFile))
    .then(() => fs.ensureSymlink(fromFile, toFile))
    .catch(err => {
      console.log(err);
      console.log(fromFile, fs.existsSync(fromFile));
      console.log(toFile, fs.existsSync(toFile));
    });
}

function symlinkInstalledBinary(pkgDir) {
  const fromFile = path.join(
    __dirname,
    '..',
    'node_modules',
    '@tradie',
    'node-package-scripts',
    'lib',
    'index.js'
  );
  const toFile = path.join(pkgDir, 'node_modules', '.bin', 'tradie');
  return symlinkBinary(fromFile, toFile);
}

function symlinkCurrentBinary(pkgDir) {
  const fromFile = path.join(__dirname, '..', 'packages', 'cli', 'lib', 'tradie.js');
  const toFile = path.join(pkgDir, 'node_modules', '.bin', 'tradie');
  return symlinkBinary(fromFile, toFile);
}

const version = getInstalledVersion();
console.log(
  `Symlinking the installed version of "${INSTALLED_TEMPLATE_NAME}@${version}" to packages:`
);
console.log();
listPackageJSONFiles()
  .then(files =>
    Promise.all(
      files.map(file => {
        const pkgname = require(file).name;

        console.log(`  ${pkgname}:`);

        if (/example/.test(pkgname)) {
          console.log('skipped');
          console.log();
          return;
        }

        // const packageMetadata = require(file);
        // if (
        //   packageMetadata.devDependencies &&
        //   packageMetadata.devDependencies[INSTALLED_TEMPLATE_NAME]
        // ) {
        return symlinkInstalledBinary(path.dirname(file));
        // }
      })
    )
  )
  .catch(error => console.log(error));
