const path = require('path');
const fs = require('fs-extra');
const resolve = require('resolve');
const finder = require('finder-on-steroids').default;

const INSTALLED_TEMPLATE_NAME = '@tradie/node-scripts';

/**
 * Get the installed version of the `tradie` template
 * @returns {string}
 */
function getInstalledVersion() {
  const metadata = require(`./node_modules/${INSTALLED_TEMPLATE_NAME}/package.json`);
  return metadata && metadata.version;
}

/**
 * List the `package.json` files of `tradie` packages which need to be
 *  built using a previous version of `tradie`.
 * @returns {Promise.<string[]>}
 */
async function listPackageJSONFiles() {
  const files = await finder(path.join(__dirname, '..'))
    .files()
    .depth(0, 4)
    .include('packages/**/package.json')
    .find();
  return files.map(file => path.join(__dirname, '..', file));
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
    'node_modules',
    '@tradie',
    'node-scripts',
    'lib',
    'index.js'
  );
  const toFile = path.join(pkgDir, 'node_modules', '.bin', 'node-scripts');
  return symlinkBinary(fromFile, toFile);
}

function symlinkCurrentBinary(pkgDir) {
  const fromFile = path.join(__dirname, '..', 'packages', 'cli', 'lib', 'tradie.js');
  const toFile = path.join(pkgDir, 'node_modules', '.bin', 'node-scripts');
  return symlinkBinary(fromFile, toFile);
}

(async () => {
  debugger;
  try {
    const version = getInstalledVersion();
    console.log(
      `Symlinking the installed version of "${INSTALLED_TEMPLATE_NAME}@${version}" to packages:`
    );
    console.log();

    const files = await listPackageJSONFiles();
    console.log(files);
    await Promise.all(
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
    );
  } catch (error) {
    console.error(error);
  }
})();
