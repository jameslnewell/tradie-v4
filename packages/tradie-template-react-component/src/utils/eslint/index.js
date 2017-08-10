function getCommonConfig() {
  return {
    extends: ['jameslnewell/react'], //TODO: add prop-types IIF flow is not configured
    settings: {
      'import/resolver': {
        [require.resolve('./resolver')]: ['styled-components-grid'] //FIXME: get project name from package.json
      }
    }
  };
}

export function getSourceConfig() {
  const config = getCommonConfig();
  return {
    ...config,
    env: {
      browser: true,
      node: true
    }
  };
}

export function getTestConfig() {
  const config = getCommonConfig();
  return {
    ...config,
    env: {
      jest: true,
      node: true
    }
  };
}
