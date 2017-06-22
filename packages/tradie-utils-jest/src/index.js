// @flow
import jest from 'jest';
import {transform} from 'babel-core';

type Options = {
  config: {},
  watch?: boolean,
  coverage?: boolean
};

export default function(options: Options): Promise<void> {
  const {config, watch = options, coverage = false} = options;

  const args = ['--config', JSON.stringify(config)];

  if (watch) {
    args.push('--watch');
  }

  if (coverage) {
    args.push('--coverage');
  }

  //TODO: support other args? https://facebook.github.io/jest/docs/cli.html

  return new Promise(() => {
    //TODO: resolve() when completed. see https://github.com/facebook/jest/issues/3737.
    jest.run(args);
  });
}

export function createBabelTransform(babelOptions: {}) {
  return {
    process(src: string, file: string) {
      return transform(src, Object.assign({filename: file}, babelOptions)).code;
    }
  };
}
