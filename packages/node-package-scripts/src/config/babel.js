/* eslint-disable import/prefer-default-export */
import path from 'path';
import Flow from '@tradie/flow-utils';
import {min} from '../utils/semver';

export function sources({root}) {
  //get min supported node version supported from engines range
  let nodeTargetVersion = '4.0.0';
  try {
    const metadata = require(path.join(root, 'package.json')); //eslint-disable-line no-require,global-require
    if (metadata.engines && metadata.engines.node) {
      nodeTargetVersion = min(metadata.engines.node);
    }
  } catch (error) {
    // default to v4
  }

  const options = {
    babelrc: false,
    presets: [
      [
        require.resolve('babel-preset-env'),
        {targets: {node: nodeTargetVersion}}
      ]
    ],
    plugins: [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-dynamic-import-node'),
      require.resolve('babel-plugin-transform-runtime')
    ]
  };

  // strip flow types if a flow config file is present
  const flow = new Flow(root);
  if (flow.configured()) {
    options.presets.push(require.resolve('babel-preset-flow'));
  }

  return options;
}

export function tests({root}) {
  return sources({root});
}
