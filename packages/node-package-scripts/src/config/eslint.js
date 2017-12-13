export function sources() {
  return {
    extends: [require.resolve('eslint-config-jameslnewell/es')],
    env: {node: true},
    rules: {
      'no-console': 1
      //TODO: disable `no-undefined` when flowtype is enabled
    }
  };
}

export function tests() {
  const config = sources();
  config.env.jest = true;
  return config;
}
