#!/usr/bin/env bash
// @flow

import {run} from '@tradie/cli';
import {cli, scripts} from '@tradie/node-package-scripts';

const resolve = require.resolve;

run({
  cli,
  configs: {
    create: resolve('./config/create'),
    clean: resolve('./config/clean'),
    lint: resolve('./config/lint'),
    build: resolve('./config/build'),
    test: resolve('./config/test')
  },
  scripts
});
