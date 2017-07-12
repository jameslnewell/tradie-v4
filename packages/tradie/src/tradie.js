#!/usr/bin/env node
import 'babel-polyfill';
import path from 'path';
import chalk from 'chalk';
import yargs from 'yargs';
import Template from './Template';
import Scripts from './Scripts';

function getScriptsByNameOrTemplate(name, template) {
  if (name) {
    return Scripts.find(name);
  } else {
    return template.getScripts();
  }
}

//configure the arguments
yargs
  .help()
  .exitProcess()
  .strict()
  .usage('Usage: tradie <command> [options]')
  .option('template', {
    describe: 'The template to use'
  })
  .option('scripts', {
    describe: 'The scripts to use'
  })
  .demandCommand(1, "run 'tradie help' for a list of available commands");

//parse the arguments
const {template: templateName, scripts: scriptsName} = yargs.argv;

Template.find(templateName)
  .then(template =>
    getScriptsByNameOrTemplate(scriptsName, template).then(scripts =>
      scripts.describe(yargs).then(() => {
        //parse the arguments now the scripts have been registered
        const args = yargs.argv;

        //get the options
        const scriptName = args._[0];
        const scriptOptions = Object.assign({}, args, {
          root: path.resolve(process.cwd()),
          debug: Boolean(process.env.DEBUG)
        });

        //run the relevant script
        return template
          .getConfig(scriptName, scriptOptions)
          .then(config => scripts.run(scriptName, config));
      })
    )
  )
  .catch(error => {
    if (error) {
      if (error instanceof Error) {
        console.error(chalk.red(error.stack)); //eslint-disable-line no-console
      } else {
        console.error(chalk.red(error)); //eslint-disable-line no-console
      }
    }
    process.exit(1);
  });
