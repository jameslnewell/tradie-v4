'use strict'
const path = require('path');
const getPaths = require('./getPaths');

module.exports = options => {
  const optimize = options.optimize;
  const paths = getPaths(options.root);

  const config = {
    babelrc: false,
    cacheDirectory: path.join(paths.tmp, 'babel'),
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
