/* eslint-disable import/prefer-default-export */
import isUsingFlow from './isUsingFlow';

export function getBabelConfig({root}) {
  const babelOptions = {
    babelrc: false,
    presets: [[require.resolve('babel-preset-env'), {targets: {node: 4}}]],
    plugins: [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-dynamic-import-node'),
      require.resolve('babel-plugin-transform-runtime')
    ]
  };

  //add flow if its configured
  if (isUsingFlow({root})) {
    babelOptions.presets.push(require.resolve('babel-preset-flow'));
  }

  return babelOptions;
}
