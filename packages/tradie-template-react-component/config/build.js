// const path = require('path');
// const babel = require('rollup-plugin-babel');

// const root = path.resolve('.');
// const src = path.resolve('src');
// const dest = path.resolve('dist');

// const pkg = require(path.resolve('./package.json'));

// module.exports = {

//   babel: [

//     //transpile to es5 commonjs for legacy
//     {
//       src,
//       dest: path.join(dest, 'es5-commonjs'),
//       include: /\.jsx?$/,
//       exclude: /\.test\.jsx?$/,
//       options: {
//         babelrc: false,
//         presets: [
//           require.resolve('babel-preset-env'),
//           require.resolve('babel-preset-react')
//         ],
//         plugins: [
//           require.resolve('babel-plugin-transform-object-rest-spread')
//         ]
//       }
//     },

//     //transpile except for es modules for treeshaking
//     {
//       src,
//       dest: path.join(dest, 'es-modules'),
//       include: /\.jsx?$/,
//       exclude: /\.test\.jsx?$/,
//       options: {
//         babelrc: false,
//         presets: [
//           [require.resolve('babel-preset-env'), {modules: false}],
//           require.resolve('babel-preset-react')
//         ],
//         plugins: [
//           require.resolve('babel-plugin-transform-object-rest-spread')
//         ]
//       }
//     }

//   ],

//   rollup: [

//     //non-optimized UMD bundle
//     {
//       format: 'umd',
//       dest: path.join(dest, `${pkg.name}.js`),
//       options: {
//         entry: path.join(src, 'index.js'), //TODO: check for index.jsx too
//         external: Object.keys(pkg.dependencies || {}),
//         plugins: [
//           babel({
//             babelrc: false,
//             exclude: 'node_modules/**',
//             presets: [
//               [require.resolve('babel-preset-env'), {modules: false}],
//               require.resolve('babel-preset-react')
//             ],
//             plugins: [
//               require.resolve('babel-plugin-transform-object-rest-spread')
//             ]
//           })
//         ]
//       }
//     },

//     //optimized UMD bundle
//     // {

//     // }

//   ]

// };
