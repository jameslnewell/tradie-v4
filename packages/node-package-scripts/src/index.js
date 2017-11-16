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
      bail: {
        default: false,
        boolean: true,
        description:
          'Exit the test suite immediately upon the first failing test.'
      },
      cache: {
        default: true,
        boolean: true,
        description:
          'Whether to use the transform cache. Disable the cache using --no-cache.'
      },
      clearCache: {
        default: false,
        boolean: true,
        description: '_'
      },
      coverage: {
        default: false,
        boolean: true,
        description:
          'Indicates that test coverage information should be collected and reported in the output.'
      },
      debug: {
        default: false,
        boolean: true,
        description: '_'
      },
      expand: {
        default: false,
        boolean: true,
        description: '_'
      },
      lastCommit: {
        default: false,
        boolean: true,
        description: '_'
      },
      noCache: {
        default: false,
        boolean: true,
        description: '_'
      },
      notify: {
        default: false,
        boolean: true,
        description: '_'
      },
      onlyChanged: {
        default: false,
        boolean: true,
        description: '_'
      },
      runInBand: {
        default: false,
        boolean: true,
        description: '_'
      },
      silent: {
        default: false,
        boolean: true,
        description: '_'
      },
      testNamePattern: {
        default: false,
        boolean: true,
        description: '_'
      },
      testPathPattern: {
        default: false,
        boolean: true,
        description: '_'
      },
      updateSnapshot: {
        default: false,
        boolean: true,
        description: '_'
      },
      useStderr: {
        default: false,
        boolean: true,
        description: '_'
      },
      verbose: {
        default: false,
        boolean: true,
        description: '_'
      },
      watch: {
        default: false,
        boolean: true,
        description: 'watch tests and re-run them when they change'
      },
      watchAll: {
        default: false,
        boolean: true,
        description: '_'
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
