const chalk = require('chalk');
const debounce = require('lodash.debounce');
const padStart = require('lodash.padstart');
const trim = require('lodash.trim');
const clear = require('tradie-utils-cli').clear;
const Files = require('tradie-utils-file');
const Transpiler = require('tradie-utils-babel');
const TypeChecker = require('tradie-utils-flow');

class Builder {
  /**
   * @param {object} options
   * @param {string} options.root
   * @param {string} options.src
   * @param {string} options.dest
   * @param {RegExp} options.include
   * @param {RegExp} options.exclude
   * @param {object} options.babel
   * @param {boolean} options.watch
   */
  constructor(options) {
    const root = options.root;
    const src = options.src;
    const dest = options.dest;
    const include = options.include;
    const exclude = options.exclude;
    const babel = options.babel;

    this.watch = options.watch;

    this.files = new Files(src, {
      watch: this.watch,
      include: include,
      exclude: exclude
    });

    //TODO: linting
    this.transpiler = new Transpiler(src, dest, babel);
    this.typechecker = new TypeChecker(root, src);

    this.errors = {};
    this.building = false;
    this.stopping = false;
    this.stopped = debounce(this.stopped.bind(this), 100);
  }

  start() {
    //create a promise we can resolve later
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    //run the initial build
    this.started('*');
    this.files
      .list()
      .then(list => Promise.all(list.map(file => this.transpile(file))))
      .then(() => this.stopped('*'), error => this.fatalError(error));

    if (this.watch) {
      this.files.on('add', file => {
        this.started(file);
        this.transpile(file).then(() => this.stopped(file));
      });

      this.files.on('change', file => {
        this.started(file);
        this.transpile(file).then(() => this.stopped(file));
      });

      this.files.on('unlink', file => {
        this.started(file);
        this.delete(file).then(() => this.stopped(file));
      });
    }

    return this;
  }

  stop() {
    this.stopping;
    if (this.watch) {
      //stop watching
      this.files.close();

      //there's no build so we can stop straight away
      if (!this.building) {
        this.resolve();
      }
    }
    return this;
  }

  wait() {
    return this.promise;
  }

  onchange(file) {}

  /** @private */
  transpile(file) {
    return this.transpiler
      .transpile(file)
      .catch(error => this.fileError(file, error));
  }

  /** @private */
  delete(file) {
    return del(this.transpiler.destFile(file)).catch(error =>
      this.fileError(file, error)
    );
  }

  /** @private */
  check() {
    return this.typechecker
      .check()
      .then(errors => {
        //squash all flow errors into a single error
        const flatErrorsByFile = {};
        errors.forEach(error => {
          if (!flatErrorsByFile[error.file]) {
            flatErrorsByFile[error.file] = [];
          }
          flatErrorsByFile[error.file].push(`${error.message}`);
        });

        //add the errors
        Object.keys(flatErrorsByFile).forEach(file => {
          this.fileError(file, flatErrorsByFile[file].join('\n'));
        });
      })
      .catch(error => this.fatalError(error));
  }

  printBuiltMessage() {
    const errorCount = Object.keys(this.errors).length;

    console.log();
    if (errorCount) {
      Object.keys(this.errors).forEach(file => {
        console.log(chalk.bgRed(chalk.white(` in ${chalk.bold(file)}: `)));
        console.log();
        //indent each line of the error
        console.log(
          `${trim(
            String(this.errors[file] instanceof Error ? this.errors[file].stack : this.errors[file])
              .split('\n')
              .map(line => `${padStart('', 4)}${line}`)
              .join('\n'),
            '\n'
          )}`
        );
      });
      console.log();
      console.log(
        chalk.red(
          chalk.bold(`  😫  Built with ${chalk.bold(errorCount)} errors`)
        )
      );
    } else {
      console.log(chalk.green('  🎉  Built successfully.'));
    }
    console.log();

    this.errors = {};
  }

  /** @private */
  started(file) {
    if (!this.building) {
      clear();
      console.log();
      console.log('  Building...');
      console.log();
    }
    this.building = true;
  }

  /** @private */
  stopped(file) {
    const finishStopped = () => {
      clear();
      this.printBuiltMessage();
      this.building = false;
      if (this.stopping) {
        this.resolve();
        this.stopped = false;
      }
    };

    //if we already have errors, show them as soon as possible
    if (Object.keys(this.errors).length) {
      finishStopped();
    } else {
      this.check()
        .then(() => finishStopped())
        .catch(error => this.fatalError(error));
    }
  }

  /** @private */
  fileError(file, error) {
    //don't override the first error
    if (this.errors[file]) {
      return;
    }

    this.errors[file] = error;
  }

  /** @private */
  fatalError(error) {
    this.reject(error);
  }
}

module.exports = Builder;
