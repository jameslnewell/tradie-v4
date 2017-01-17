const path = require('path');
const WebpackConfigBuilder = require('tradie-webpack-config');

const getBabelConfig = options => {

  const config = {
    presets: [
      'react',
      ['es2015', {modules: false}]
    ],
    plugins: [
      'transform-object-rest-spread',
      'transform-class-properties',
    ]
  };

  //give react better debugging information
  if (!options.optimize) {
    config.plugins.concat(
      'transform-react-jsx-source',
      'transform-react-jsx-self'
    );
  }

  //TODO: copy optimizations from create-react-app

  return config;
};

const getEslintConfig = options => {

  const config = {
    extends: ['jameslnewell/react']
  };

  if (typeof options.target === 'undefined' || options.target === 'web') {
    config.env = {
      browser: true
    };
  }

  if (options.test) {
    config.extends.push('jameslnewell/test'); //FIXME: not working?
  }

  return config;
};

/**
 *
 * @param   {object}          options
 * @param   {boolean}         [options.test=false]
 * @param   {string}          [options.target='web']
 * @param   {string}          [options.styles=false] false|ignore|inline|external
 * @returns {object}
 */
module.exports = options => {

  const builder = new WebpackConfigBuilder({
    root: path.resolve('.'),
    src: path.resolve('./src'),
    tmp: path.resolve('./tmp'),
    dest: path.resolve('./dist'),
    optimize: options.optimize,
    publicPath: process.env.BASE_URL || '/'
  });

  builder.configureScripts({
    babel: getBabelConfig(options),
    eslint: getEslintConfig(options),
    extensions: ['.js', '.jsx']
  });

  if (options.styles === 'ignore') {
    builder.ignoreStyles({
      extensions: ['.css', '.scss']
    });
  } else if (options.styles === 'inline' || options.styles === 'external') {
    builder.configureStyles({
      extract: options.styles === 'external',
      extensions: ['.css', '.scss']
    });
  }

  builder.configureJSON();

  builder.configureFiles({
    excludeExtensions: [
      '.js', '.jsx',
      '.css', '.scss',
      '.json'
    ]
  });

  builder.merge({

    target: options.target || 'web',

    //resolve files relative to the template (e.g. webpack/hot/client) //TODO: move to tradie-webpack-config
    resolve: {
      modules: [
        'node_modules',
        path.join(__dirname, '..', '..', 'node_modules')
      ]
    },

    //resolve loaders relative to the template (e.g. json-loader) //TODO: move to tradie-webpack-config
    resolveLoader: {
      modules: [
        'node_modules',
        path.join(__dirname, '..', '..', 'node_modules')
      ]
    }

  });

  return builder;
};
