import * as Webpack from 'webpack';
import {getWebpackConfig} from '../utils/webpack';

export function dev(root: string): {webpack: Webpack.Configuration} {
  return {
    webpack: getWebpackConfig(root)
  };
}
