#!/usr/bin/env node
// @flow

import {run} from '@tradie/cli';

run([
  {
    cmd: 'clean',
    desc: 'Clean',
    exec: require.resolve('./scripts/clean')
  },
  {
    cmd: 'lint',
    desc: 'Lint',
    exec: require.resolve('./scripts/lint')
  },
  {
    cmd: 'dev',
    desc: 'Develop',
    exec: require.resolve('./scripts/dev')
  },
  {
    cmd: 'build',
    desc: 'Build',
    exec: require.resolve('./scripts/build')
  },
  {
    cmd: 'test',
    desc: 'Test',
    exec: require.resolve('./scripts/test')
  }
]);
