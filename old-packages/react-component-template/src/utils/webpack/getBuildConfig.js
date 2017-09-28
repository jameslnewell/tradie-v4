import webpack from 'webpack';
import getCommonConfig from './getCommonConfig';

export default function({root}) {
  const config = getCommonConfig({root, optimize: true});

  if (!config) {
    return config;
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  );

  /* eslint-disable camelcase */
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false
      },
      output: {
        comments: false,
        ascii_only: true
      },
      sourceMap: true
    })
  );
  /* eslint-enable camelcase */

  return config;
}
