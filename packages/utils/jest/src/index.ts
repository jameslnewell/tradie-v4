import { run } from 'jest-cli';
export { default as createBabelTransform } from './transform/createBabelTransform';
export { default as createTypescriptTransform } from './transform/createTypescriptTransform';

export interface JestOptions {
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

export default function (options: JestOptions, config: { [name: string]: any }): Promise<void> {
  const args = ['--config', JSON.stringify(config)];

  (Object.keys(options) as (keyof JestOptions)[]).forEach((jestFlag: keyof JestOptions) => {
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
