const getCommonConfig = require('./getBabelCommonConfig');

module.exports = options => {
  const optimize = options.optimize;
  const config = getCommonConfig(options);

  config.presets.push(
    [require.resolve('babel-preset-env'), {

      //don't transpile ES2015 imports/exports, let Webpack do tree-shaking
      modules: false,

      //only include necessary polyfills for the target
      useBuiltIns: true,

      //transpile for the oldest supported NodeJS LTS - https://github.com/nodejs/LTS
      targets: {
        node: 4
      }

    }]
  );

  return config;
};
