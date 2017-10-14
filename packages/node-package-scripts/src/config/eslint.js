export function sources() {
  return {
    extends: ['jameslnewell/es'],
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
