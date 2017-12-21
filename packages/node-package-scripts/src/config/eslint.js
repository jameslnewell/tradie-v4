export function source() {
  return {
    extends: [require.resolve('eslint-config-jameslnewell/es')],
    env: {node: true},
    rules: {
      'no-console': 1
      //TODO: disable `no-undefined` when flowtype is enabled
    }
  };
}

export function test() {
  const config = source();
  config.env.jest = true;
  return config;
}
