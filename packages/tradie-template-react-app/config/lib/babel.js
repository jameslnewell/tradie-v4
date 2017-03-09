
const getCommonConfig = options => {
  const tmp = options.tmp;
  const optimize = options.optimize;

  const config = {
    babelrc: false,
    cacheDirectory: tmp,
    presets: [
      require.resolve('babel-preset-react')
    ],
    plugins: [

      //improve styled-components experience
      [require.resolve('babel-plugin-styled-components'), {
        displayName: !optimize,
        ssr: true,
        minify: optimize,
        transpileTemplateLiterals: optimize
      }],

      //makes classes easier
      require.resolve('babel-plugin-transform-class-properties'),

      //makes conditional logic in JSX easier
      require.resolve('babel-plugin-transform-do-expressions'),

      //makes Webpack v2 imports work
      require.resolve('babel-plugin-syntax-dynamic-import'),

      //makes working with objects way more pleasant
      require.resolve('babel-plugin-transform-object-rest-spread'),

      //TODO: support flowtype? `transform-flow-strip-types`

    ]
  };

  if (!optimize) {

    //improve react debugging experience
    config.plugins = config.plugins.concat(
      require.resolve('babel-plugin-transform-react-jsx-source'),
      require.resolve('babel-plugin-transform-react-jsx-self')
    );

  }

  return config;
};

module.exports.getClientConfig = options => {
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

module.exports.getServerConfig = options => {
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
        node: 4,
      }

    }]
  );

  return config;
};
