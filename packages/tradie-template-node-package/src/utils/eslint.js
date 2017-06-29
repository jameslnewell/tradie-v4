export function getESLintConfig() {
  return {
    extends: ['jameslnewell/es'],
    env: {node: true},
    rules: {
      'no-console': 1
    }
  };
}

export function getTestESLintConfig(options) {
  const config = getESLintConfig(options);
  config.env.jest = true;
  return config;
}
