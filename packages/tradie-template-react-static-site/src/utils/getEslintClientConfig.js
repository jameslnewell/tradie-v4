import getEslintCommonConfig from './getEslintCommonConfig';

export default options => {
  const config = getEslintCommonConfig(options);
  return Object.assign({}, config, {
    env: {
      browser: true
    },
    globals: Object.assign(config.globals, {
      process: false
    }),
    extends: [].concat(config.extends)
  });
};
