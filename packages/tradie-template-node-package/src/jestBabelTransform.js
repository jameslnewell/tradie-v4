/* eslint-disable import/no-commonjs */
import {createBabelTransform} from 'tradie-utils-jest';
import getBabelConfig from './getBabelConfig';

//jest doesn't work with es module exports
module.exports = createBabelTransform(
  Object.assign({}, getBabelConfig({root: process.cwd()}), {
    //FIXME: use root variable from command config
    retainLines: true,
    sourceMaps: 'inline'
  })
);
