/* eslint-disable camelcase */
import path from 'path';
import toPascalCase from 'to-pascal-case';
import babelPlugin from 'rollup-plugin-babel';
import resolvePlugin from 'rollup-plugin-node-resolve';
import commonjsPlugin from 'rollup-plugin-commonjs';
import replacePlugin from 'rollup-plugin-replace';
import uglifyPlugin from 'rollup-plugin-uglify';
import * as babel from './babel';

export function getUMDOptions(options) {
  const {root, optimized} = options;

  const manifest = require(path.resolve(root, 'package.json')); //eslint-disable-line

  //get the package and module names
  const packageName = manifest.name;
  const libraryName = toPascalCase(packageName);

  const rollupOptions = {
    entry: 'src/index.js', //FIXME: check for index.js or index.jsx
    external: [].concat(
      Object.keys(manifest.dependencies || {}),
      Object.keys(manifest.devDependencies || {}),
      Object.keys(manifest.peerDependencies || {}),
      Object.keys(manifest.optionalDependencies || {})
    ),
    plugins: [
      resolvePlugin({
        extensions: ['.js', '.jsx', '.json']
      }),
      commonjsPlugin(),
      babelPlugin(babel.getUMDOptions())
    ],
    targets: [
      {
        format: 'umd',
        dest: optimized
          ? `dist/${packageName}.min.js`
          : `dist/${packageName}.js`,
        moduleName: `${libraryName}`, //FIXME: should be configurable by the user
        globals: id => toPascalCase(id) //FIXME: e.g. StyledComponents should be `styled` (create a library of common names?)
      }
    ]
  };

  if (optimized) {
    rollupOptions.plugins.push(
      replacePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    );

    rollupOptions.plugins.push(
      uglifyPlugin({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    );
  }

  return rollupOptions;
}
