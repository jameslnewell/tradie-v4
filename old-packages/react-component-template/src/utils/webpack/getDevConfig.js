import webpack from 'webpack';
import getCommonConfig from './getCommonConfig';

export default function({root}) {
  const config = getCommonConfig({root});

  if (!config) {
    return config;
  }

  return {
    ...config,
    devtool: 'eval',
    plugins: [...config.plugins, new webpack.NamedModulesPlugin()]
  };
}
