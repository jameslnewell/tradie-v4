import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as babel from '../babel';

export function getOptions({root}) {
  const jsEntry = path.join(root, 'demo/index.js');
  const htmlEntry = path.join(root, 'demo/index.html');
  const htmlPluginOptions = {};

  if (!fs.existsSync(jsEntry)) {
    return null;
  }

  if (fs.existsSync(htmlEntry)) {
    htmlPluginOptions.template = htmlEntry;
  } else {
    htmlPluginOptions.template = path.resolve(__dirname, 'template.ejs'); //FIXME: copy other files
  }

  return {
    context: root,
    entry: jsEntry,
    output: {
      filename: 'index.js',
      path: path.join(root, 'dist/demo')
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [path.join(root, 'src'), path.join(root, 'demo')],
          use: {
            loader: require.resolve('babel-loader'),
            options: babel.getDemoOptions()
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    plugins: [new HtmlWebpackPlugin(htmlPluginOptions)]
  };
}
