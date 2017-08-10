import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as babel from '../babel';

//TODO: check for a demo folder or return null

function getHTMLPluginOptions({root, optimize = false}) {
  const example = path.join(root, 'example');
  const htmlPluginOptions = {};
  if (optimize) {
    htmlPluginOptions.minify = {
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
  const templatePath = path.join(example, 'index.html');
  if (fs.existsSync(templatePath)) {
    htmlPluginOptions.template = templatePath;
  } else {
    // htmlPluginOptions.template = path.resolve(__dirname, 'template.ejs'); //FIXME: copy other files
    htmlPluginOptions.templateContent = '<div id="app"></div>';
  }
  return htmlPluginOptions;
}

export default function({root, optimize}) {
  const manifest = require(path.join(root, 'package.json')); //eslint-disable-line global-require

  //check for index.js or index.jsx
  let entry;
  const src = path.join(root, 'src');
  const example = path.join(root, 'example');
  if (fs.existsSync(path.join(example, 'index.js'))) {
    entry = path.join(example, 'index.js');
  } else if (fs.existsSync(path.join(example, 'index.jsx'))) {
    entry = path.join(example, 'index.jsx');
  } else {
    return null;
  }

  return {
    context: root,
    entry,
    output: {
      filename: 'index.js',
      path: path.join(root, 'dist/example'),
      publicPath: process.env.PUBLIC_PATH || '/' //TODO: ensure trailing slash
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [src, example],
          use: {
            loader: require.resolve('babel-loader'),
            options: babel.getExampleOptions()
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        [manifest.name]: src
      }
    },
    plugins: [new HtmlWebpackPlugin(getHTMLPluginOptions({root, optimize}))]
  };
}
