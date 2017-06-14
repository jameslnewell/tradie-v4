// const fs = require('fs');
// const path = require('path');
// const glob = require('glob');
// const mkdirp = require('mkdirp');
// const babel = require('babel-core');
// const rollup = require('rollup');

// function listFiles(dir) {
//   return new Promise((resolve, reject) => {
//     glob('**/*.*', {cwd: dir}, (error, files) => {
//       if (error) return reject(error);
//       return resolve(files);
//     })
//   });
// }

// function createIncludeFilter(filter) {

//   if (typeof filter === 'undefined') {
//     return () => true;
//   }

//   if (filter instanceof RegExp) {
//     return file => filter.test(file);
//   }

//   return filter;
// }

// function createExcludeFilter(filter) {

//   if (typeof filter === 'undefined') {
//     return () => true;
//   }

//   if (filter instanceof RegExp) {
//     return file => !filter.test(file);
//   }

//   return filter;
// }

// /**
//  * @param {object[]} config
//  */
// function babelify(config) {
//   return Promise.all(config.map(cfg => listFiles(cfg.src).then(files => Promise.all(
//       files
//         .filter(createIncludeFilter(cfg.include, () => true))
//         .filter(createExcludeFilter(cfg.exclude, () => false))
//         .map(file => new Promise((resolve, reject) => {
//           const srcFile = path.join(cfg.src, file);
//           const destFile = path.join(cfg.dest, file);
//           babel.transformFile(srcFile, cfg.options, (babelError, result) => {
//             if (babelError) return reject(babelError);
//             mkdirp(path.dirname(destFile), mkdirError => {
//               if (mkdirError) return reject(mkdirError);
//               fs.writeFileSync(destFile, result.code);
//               // fs.writeFileSync(`${path.join(opts.dest, file)}.map`, result.map);
//               return resolve();
//             });
//           });
//         }))
//     ))
//   ));
// }

// /**
//  *
//  * @param {*} path The destination path
//  * @param {*} config.format
//  * @param {*} config.dest
//  * @param {*} config.options
//  */
// function rollupify(config) {
//   return Promise.all(config.map(cfg => new Promise((resolve, reject) => {
//     mkdirp(path.dirname(cfg.dest), mkdirError => {
//       if (mkdirError) return reject(mkdirError);
//       rollup.rollup(cfg.options).then(bundle => bundle.write({
//         format: cfg.format,
//         dest: cfg.dest
//       }));
//     });
//   })));
// }

// /**
//  * @param object    options
//  * @param object[]  options.babel
//  * @param object    options.rollup
//  */
// module.exports = function(options) {
//   return Promise.all([
//     babelify(options.babel),
//     rollupify(options.rollup)
//   ]);
// };

// module.exports(require('../config/build.js'));
