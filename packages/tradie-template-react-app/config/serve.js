const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const src = path.resolve('./src');
const dest = path.resolve('./dist');

const commonConfig = {
  // devtool: 'eval',
  context: src,
  output: {
    path: dest,
    filename: '[name].js',
    publicPath: '/',
    pathinfo: true //true in dev only
  },
  module: {
    rules: [

      //transpile JS
      {
        test: /\.js$/,
        include: src, //don't transpile JS outside the `./src` dir - doing so would really affect build times and isn't necessary
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('babel-preset-latest'), {}],
              require.resolve('babel-preset-react')
            ],
            plugins: [
              require.resolve('babel-plugin-transform-class-properties'), //makes classes easier
              require.resolve('babel-plugin-transform-do-expressions'), //makes conditional logic in JSX easier
              require.resolve('babel-plugin-syntax-dynamic-import'), //makes Webpack v2 imports work
              require.resolve('babel-plugin-transform-object-rest-spread'), //makes working with objects way more pleasant
              //TODO: support flowtype? `transform-flow-strip-types`
            ]
          }
        }
      }

    ]
  }
};

module.exports = options => {

  return {

    webpack: {

      client: Object.assign({}, commonConfig, {
        entry: {client: './client.js'},
        output: Object.assign({}, commonConfig.output, {
          chunkFilename: 'client.[id].js'
        })
      }),

      server: Object.assign({}, commonConfig, {
        entry: {server: './server.js'},
        target: 'node',
        externals: [nodeExternals()],
        plugins: [

          //don't do code-splitting for the server chunk
          new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
          })

        ]
      })

    }
  };

};
