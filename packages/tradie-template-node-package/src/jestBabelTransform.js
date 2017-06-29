/* eslint-disable import/no-commonjs */
import {createBabelTransform} from 'tradie-utils-jest';
import {getBabelConfig} from './babel';

//TODO: switch to babel-jest

//jest doesn't work with es module exports
module.exports = createBabelTransform(
  Object.assign({}, getBabelConfig({root: process.cwd()}), {
    //FIXME: use root variable from command config
    //FIXME: source maps don't seem to be working
    retainLines: true,
    sourceMaps: 'inline'
  })
);
