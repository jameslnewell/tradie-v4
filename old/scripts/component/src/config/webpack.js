import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as babel from './babel';
import {ROOT, CODE_SRC, EXAMPLE_SRC, EXAMPLE_DEST} from './paths';

function getEntry() {
  if (fs.existsSync(path.join(EXAMPLE_SRC, 'index.js'))) {
    return path.join(EXAMPLE_SRC, 'index.js');
  } else if (fs.existsSync(path.join(EXAMPLE_SRC, 'index.jsx'))) {
    return path.join(EXAMPLE_SRC, 'index.jsx');
  } else {
    throw new Error(
      'Example not found. Please create a `./example/index.js` or `./example/index.jsx` file.'
    );
  }
}

function getHTMLPlugin(optimize = false) {
  const options = {};
  if (optimize) {
    options.minify = {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    };
  }
  const templatePath = path.join(EXAMPLE_SRC, 'index.html');
  if (fs.existsSync(templatePath)) {
    options.template = templatePath;
  } else {
    // htmlPluginOptions.template = path.resolve(__dirname, 'template.ejs'); //FIXME: copy other files
    options.templateContent = '<div id="app"></div>';
  }
  return new HtmlWebpackPlugin(options);
}

export default function({optimize = false} = {}) {
  const packageName = require(path.join(ROOT, 'package.json')).name; //eslint-disable-line global-require

  const config = {
    context: ROOT,
    entry: getEntry(),
    output: {
      filename: 'index.js',
      path: EXAMPLE_DEST,
      publicPath: process.env.PUBLIC_PATH || '.' //TODO: ensure trailing slash
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [CODE_SRC, EXAMPLE_SRC],
          use: {
            loader: require.resolve('babel-loader'),
            options: babel.example({optimize})
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        [packageName]: CODE_SRC
      }
    },
    plugins: [getHTMLPlugin(optimize)]
  };

  if (optimize) {
    return {
      ...config,
      devtool: 'eval',
      plugins: [...config.plugins, new webpack.NamedModulesPlugin()]
    };
  } else {
    return config;
  }
}
