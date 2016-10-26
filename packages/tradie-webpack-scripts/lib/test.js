'use strict';
const path = require('path');
const spawn = require('child_process').spawn;
const MemoryFS = require('memory-fs');
const webpack = require('webpack');
const runWebpack = require('./util/runWebpack');
const TestReporter = require('./util/TestReporter');

/**
 * Run webpack on multiple bundles and display the results
 * @param {object}  options
 * @param {string}  [options.root]
 * @param {boolean} [options.debug=false]
 * @param {boolean} [options.watch=false]
 * @param {object}  options.webpack
 * @returns {Promise.<null>}
 */
module.exports = options => new Promise((resolve, reject) => {
  const reporter = new TestReporter({debug: options.debug});

  let runner = null;
  const compiler = webpack(options.webpack);
  const virtualFileSystem = new MemoryFS();

  reporter.observe(compiler);

  //if the test runner is still running when we start the next compilation, stop the test runner
  compiler.plugin('compile', () => {
    if (runner) {
      runner.kill();
    }
  });

  //run the tests
  compiler.plugin('done', stats => {
    const json = stats.toJson();

    //if we have a syntax error or a resolve error, then show the webpack error and don't try and run the test bundle (which is guaranteed to fail and produce a similar, more verbose error)
    if (json.errors.find(error => /SyntaxError/.test(error) || /Error: Can't resolve/.test(error))) {
      if (!options.watch) {
        reject();
      }
      return;
    }

    //find the first JS file and read the output
    const asset = json.assets.find(asset => /\.js$/.test(asset.name));
    if (!asset) {
      reject(new Error(`tradie: No test bundle found.`));
      return;
    }
    const compiledOutput = virtualFileSystem.readFileSync(
      path.join(options.webpack.output.path, asset.name)
    );

    //create the test runner
    runner = spawn('node', {cwd: options.root});

    //handle errors running the test runner
    runner
      .on('error', error => console.error(error))
      .on('exit', exitCode => {
        if (!options.watch) {
          if (exitCode === 0) {
            resolve();
          } else {
            reject();
          }
        }
      })
    ;

    //forward the output of the test runner to stdout/stderr
    runner.stdout.pipe(process.stdout);
    runner.stderr.pipe(process.stderr);

    //pass the compiled output to the test runner
    runner.stdin.write(compiledOutput);
    runner.stdin.end();

  });

  //we don't want to write the compiled tests to disk so use a virtual filesystem
  compiler.outputFileSystem = virtualFileSystem;

  //compile the tests
  runWebpack(options.watch, compiler)
    .catch(reject)
  ;

});
