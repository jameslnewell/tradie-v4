// @flow

const resolve = require.resolve;

export const cli = {
  create: {
    desc: 'Create a new project',
    args: {}
  },
  clean: {
    desc: 'Remove generated files',
    args: {}
  },
  lint: {
    desc: 'Lint source and test files',
    args: {
      watch: {
        default: false,
        boolean: true,
        description: 'watch source files and re-lint them when they change'
      }
    }
  },
  build: {
    desc: 'Transpile source files',
    args: {
      watch: {
        default: false,
        boolean: true,
        description: 'watch test files and re-run them when they change'
      }
    }
  },
  test: {
    desc: 'Run test files',
    args: {
      watch: {
        default: false,
        boolean: true,
        description: 'watch test files and re-run them when they change'
      },
      coverage: {
        default: false,
        boolean: true,
        description: 'report test coverage'
      }
    }
  }
};

export const scripts = {
  create: resolve('./script/create'),
  clean: resolve('./script/clean'),
  lint: resolve('./script/lint'),
  build: resolve('./script/build'),
  test: resolve('./script/test')
};
