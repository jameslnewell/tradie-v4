// @flow
import {run} from 'jest-cli';
export {default as createBabelTransform} from './transform/createBabelTransform';
export {default as createTypescriptTransform} from './transform/createTypescriptTransform';

type Options = {
  bail?: boolean,
  cache?: boolean,
  clearCache?: boolean,
  coverage?: boolean,
  debug?: boolean,
  expand?: boolean,
  lastCommit?: boolean,
  noCache?: boolean,
  notify?: boolean,
  onlyChanged?: boolean,
  runInBand?: boolean,
  silent?: boolean,
  testNamePattern?: string,
  testPathPattern?: string,
  updateSnapshot?: boolean,
  useStderr?: boolean,
  verbose?: boolean,
  watch?: boolean,
  watchAll?: boolean
};

const jestFlags = [
  'bail',
  'cache',
  'clearCache',
  'coverage',
  'debug',
  'expand',
  'lastCommit',
  'noCache',
  'notify',
  'onlyChanged',
  'runInBand',
  'silent',
  'testNamePattern',
  'testPathPattern',
  'updateSnapshot',
  'useStderr',
  'verbose',
  'watch',
  'watchAll'
];

export default function(options: Options, config: {}): Promise<void> {
  const args = ['--config', JSON.stringify(config)];

  jestFlags.forEach(jestFlag => {
    const value = options[jestFlag];
    if (typeof value === 'boolean') {
      if (value === true) {
        args.push(`--${jestFlag}`);
      }
    } else if (typeof value !== 'undefined') {
      args.push(`--${jestFlag}=${value}`);
    }
  });

  //TODO: support other args? https://facebook.github.io/jest/docs/cli.html

  return new Promise(() => {
    //TODO: resolve() when completed. see https://github.com/facebook/jest/issues/3737.
    run(args);
  });
}
