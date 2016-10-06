
/**
 * @param {boolean} watch
 * @param {object} compiler
 */
module.exports = (watch, compiler) => new Promise((resolve, reject) => {

  if (watch) {

    const watcher = compiler.watch({}, error => {
      if (error) {
        console.error(error);
        reject();
      }
    });

    //stop watching and exit when the user presses CTL-C
    process.on('SIGINT', () => {
      watcher.close(() => resolve());
    });

  } else {

    compiler.run(error => {
      if (error) {
        console.error(error);
        reject();
      } else {
        resolve();
      }
    });

  }

});
