const del = require('del');
const chalk = require('chalk');
const clear = require('tradie-utils-cli').clear;

module.exports = function(options) {
  
  clear();
  console.log();
  console.log('  Cleaning...');
  console.log();

  return del(options.paths).then(() => {

    clear()
    console.log();
    console.log(chalk.green('  🎉  Cleaned successfully.'));
    console.log();

  })
  ;
};
