// @ts-ignore
import {createTransformer} from 'babel-jest';
import babelOptions from './babelOptions';

module.exports = createTransformer(babelOptions);
