#!/usr/bin/env node
'use strict';
const path = require('path');
const chalk = require('chalk');
const commander = require('commander');
const metadata = require('../package.json');

const createAction = function() {
  const cmdName = this.name();
  const cmdOptions = this.opts();

  const apiOptions = Object.assign({}, cmdOptions, {
    cmd: cmdName,
    root: path.resolve(process.cwd()),
    debug: Boolean(process.env.DEBUG)
  });

  require(`../lib/${cmdName}`)(apiOptions)
    .catch(error => {
      console.log('exiting with error', error);
      if (error) {
        if (error instanceof Error) {
          console.error(chalk.red(error.stack));
        } else {
          console.error(chalk.red(error));
        }
      }
      process.exit(1);
    })
  ;
};

commander
  .version(metadata.version)
  .usage('[command] [options]')
  .description(metadata.description)
;

commander
  .command('clean')
  .description('remove bundled script, style and asset files')
  .action(createAction)
;

commander
  .command('serve')
  .description('bundle script, style and asset files as they change')
  .action(createAction)
;

commander
  .command('build')
  .description('bundle script, style and asset files')
  .option('--watch', 're-bundle script, style and asset files whenever they change', false)
  .option('--optimize', 'optimize script, style and asset files, including minification, dead-code removal, file hashing etc', false)
  .action(createAction)
;

commander
  .command('test [files...]')
  .description('test script files')
  .option('--watch', 're-test script files whenever they change', false)
  .action(createAction)
;

//show help if an unknown command is provided
commander
  .command('*', '', {noHelp: true})
  .action(() => {
    commander.outputHelp();
    process.exit(1);
  })
;

commander.parse(process.argv);

//show help if no command is provided
if (!process.argv.slice(2).length) {
  commander.outputHelp();
  process.exit(1);
}

