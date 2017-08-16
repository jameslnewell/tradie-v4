import fs from 'fs';
import webpack from 'webpack';
import CollectFilesPlugin from '@tradie/old-webpack-utils/CollectFilesPlugin';
import getPaths from './getPaths';
import getEslintClientConfig from './getEslintClientConfig';
import getBabelClientConfig from './getBabelClientConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';

export default options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;
  const manifest = options.manifest;

  if (!fs.existsSync(paths.vendorEntryFile)) {
    return null;
  }

  const config = getWebpackCommonConfig(
    Object.assign({}, options, {
      eslint: getEslintClientConfig(options),
      babel: getBabelClientConfig(options)
    })
  );

  config.entry = {vendor: [paths.vendorEntryFile]};

  config.plugins.push(
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false
    })
  );

  // === configure the DLL ===

  config.output.library = optimize ? '[name]_[chunkhash:8]' : '[name]';
  config.plugins.push(
    new webpack.DllPlugin({
      path: paths.vendorManifestFile,
      name: config.output.library
    })
  );

  // === collect files ===

  config.plugins.push(
    new CollectFilesPlugin({
      cache: manifest
    })
  );

  // === uglify ===

  if (optimize) {
    //babili + uglify gives better results and uglify is the only way to get react-devtools to be quiet about the bundle not being minified
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        output: {
          comments: false
        },
        sourceMap: true
      })
    );
  }

  return config;
};
