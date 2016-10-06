import webpack from 'webpack';
import extensionsToRegex from 'ext-to-regex';

export default function ignoreStyles(options, webpackConfig) {
  const {extensions} = options;

  //TODO: switch to `ignore-loader`?
  webpackConfig.plugins.push(new webpack.NormalModuleReplacementPlugin(
    extensionsToRegex(extensions),
    require.resolve('node-noop')
  ));

}
