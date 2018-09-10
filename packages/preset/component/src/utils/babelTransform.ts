// @ts-ignore
import {createTransformer} from 'babel-jest';
import {cjs} from './babelOptions';

module.exports = createTransformer(cjs());
