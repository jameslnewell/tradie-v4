// @flow

export function source() {
  return {
    extends: [require.resolve('eslint-config-jameslnewell/react')],
    env: {browser: true},
    rules: {
      'no-console': 1
      //TODO: disable `no-undefined` when flowtype is enabled
    }
  };
}

export function example() {
  return source();
}

export function test() {
  const config = source();
  //$FlowFixMe
  config.env.jest = true;
  return config;
}
