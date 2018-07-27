import * as fs from 'fs';
import * as path from 'path';
import * as Webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

const DEBUG = Boolean(process.env.DEBUG);

function getTemplate(root: string) {
  const defaultTemplatePath = path.join(__dirname, 'template.html');
  const userTemplatePath = path.join(root, 'src/index.html');
  if (fs.existsSync(userTemplatePath)) {
    return userTemplatePath;
  } else {
    return defaultTemplatePath;
  }
}

export function getWebpackConfig(root: string): Webpack.Configuration {

  const typescriptConfigFile = require.resolve('../typescript/tsconfig.website.json');
  const tsxEntryFile = path.join(root, 'website/src/index.tsx');
  const tsEntryFile = path.join(root, 'website/src/index.ts');

  return ({
    mode: 'development',

    devtool: 'source-map',

    context: root,

    entry: [
      fs.existsSync(tsxEntryFile) ? tsxEntryFile: tsEntryFile
    ],

    output: {
      filename: 'index.js'
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],

      // use "source" over the other built files to avoid having to run build after changing
      mainFields: ['source', 'browser', 'module', 'main'],

      // give users a nice name for accessing the project-info loader
      alias: {
        '@tradie/project-info': require.resolve('./project-info-placeholder.txt')
      }

    },

    module: {
      rules: [
        {
          test: /project-info-placeholder.txt/,
          exclude: /node_modules/,
          loader: require.resolve('./project-info-loader'),
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: require.resolve('ts-loader'),
          options: {
            configFile: typescriptConfigFile,
            logLevel: DEBUG ? 'debug' : 'silent',
            silent: DEBUG ? false : true,
            logInfoToStdOut: false,
            transpileOnly: false, // TODO: write own plugin to do typechecking
            errorFormatter: (error: {line: string; character: string; content: string;}) => {
              return `${error.line}:${error.character} ${error.content}`;
            }

          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({ // TODO: use package name for page title
        template: getTemplate(root)
      })
    ]

  });

}
