#!/usr/bin/env node
// @flow
import {run} from '@tradie/cli';

const resolve = require.resolve;

run([
  {
    cmd: 'create',
    desc: 'Create a new project',
    exec: resolve('./scripts/create')
  },

  {
    cmd: 'clean',
    desc: 'Remove generated files and folders',
    exec: resolve('./scripts/clean')
  },

  {
    cmd: 'lint',
    desc: 'Lint sources, tests and examples',
    opts: {
      watch: {
        default: false,
        boolean: true,
        description:
          'watch sources, tests and examples and re-lint them when they change'
      }
    },
    exec: resolve('./scripts/lint')
  },

  {
    cmd: 'build',
    desc: 'Transpile sources',
    opts: {
      watch: {
        default: false,
        boolean: true,
        description: 'watch sources and re-transpile them when they change'
      }
    },
    exec: resolve('./scripts/build')
  },

  {
    cmd: 'test',
    desc: 'Run tests',
    opts: {
      watch: {
        default: false,
        boolean: true,
        description: 'watch tests and re-run them when they change'
      },
      coverage: {
        default: false,
        boolean: true,
        description: 'report test coverage'
      }
    },
    exec: resolve('./scripts/test')
  },

  {
    cmd: 'example <module>',
    desc: 'Run examples',
    exec: resolve('./scripts/example')
  }
]);
