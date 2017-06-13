#!/usr/bin/env node
'use strict';

var path = require('path');
var chalk = require('chalk');
var yargs = require('yargs');
var metadata = require('../package.json');
var Template = require('./Template');

Template.find().then(function (template) {
  return template.getScripts().then(function (scripts) {
    return scripts.describe(yargs).then(function () {
      //configure the arguments
      yargs.help().exitProcess().strict().usage('Usage: tradie <command> [options]').demandCommand(1, "run 'tradie help' for a list of available commands");

      //parse the arguments
      var args = yargs.argv;

      //get the options
      var scriptName = args._[0];
      var scriptOptions = Object.assign({}, args, {
        root: path.resolve(process.cwd()),
        debug: Boolean(process.env.DEBUG)
      });

      //run the relevant script
      return template.getConfig(scriptName, scriptOptions).then(function (config) {
        return scripts.run(scriptName, config);
      });
    });
  });
}).catch(function (error) {
  if (error) {
    if (error instanceof Error) {
      console.error(chalk.red(error.stack)); //eslint-disable-line no-console
    } else {
      console.error(chalk.red(error)); //eslint-disable-line no-console
    }
  }
  process.exit(1);
});