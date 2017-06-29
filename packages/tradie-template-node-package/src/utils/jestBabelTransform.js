/* eslint-disable import/no-commonjs */
import {createBabelTransform} from 'tradie-utils-jest';
import {getBabelConfig} from './babel';

//NOTE: Jest doesn't work with es module exports
//FIXME: use root variable from command config
module.exports = createBabelTransform(getBabelConfig({root: process.cwd()}));
