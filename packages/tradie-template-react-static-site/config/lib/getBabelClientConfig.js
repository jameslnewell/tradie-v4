const getCommonConfig = require('./getBabelCommonConfig');

module.exports = options => {
  const config = getCommonConfig(options);

  config.presets.push(
    [require.resolve('babel-preset-env'), {

      //don't transpile ES2015 imports/exports, let Webpack do tree-shaking
      modules: false,

      //only include necessary polyfills for the target
      useBuiltIns: true,

      //transpile for recent browsers
      targets: {
        browsers: 'last 2 versions, > 5%, ie >= 11'
      }

    }]
  );

  return config;
};