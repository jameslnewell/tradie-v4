#!/usr/bin/env node
import * as path from 'path';
import * as yargs from 'yargs';

// tslint:disable no-unused-expression
yargs.commandDir(path.join(__dirname, 'commands')).demandCommand().help().argv;
