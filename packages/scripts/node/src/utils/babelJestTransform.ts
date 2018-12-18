// @ts-ignore
import {createTransformer} from 'babel-jest';
import { getBabelOptions } from '../config/getBabelOptions';
const babelOptions = getBabelOptions();

module.exports = createTransformer(babelOptions.tests);
