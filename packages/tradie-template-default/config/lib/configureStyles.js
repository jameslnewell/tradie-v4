'use strict';
const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const extensionsToRegex = require('ext-to-regex');
const CheckVersionConflictPlugin = require('./CheckVersionConflictPlugin');

 module.exports = (tradieConfig, webpackConfig) => {

  //configure the style filename
  let filename = tradieConfig.optimize ? '[name].[contenthash].css' : '[name].css';
  if (tradieConfig.style.outputFilename) {
    filename = tradieConfig.style.outputFilename;
  }

  webpackConfig.plugins.push(
   new webpack.LoaderOptionsPlugin({
     test: extensionsToRegex(tradieConfig.style.extensions),
     options: {

       //webpack props required by loaders https://github.com/bholloway/resolve-url-loader/issues/33#issuecomment-249522569
       context: tradieConfig.src,
       output: {
         path: tradieConfig.dest
       },

       postcss: [
         autoprefixer({browsers: ['> 4%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']})
         //NOTE: css-loader looks for NODE_ENV=production and performs minification so we don't need cssnano
       ],
       sassLoader: {
         importer: (url, prev, done) => {

           const basedir = path.dirname(prev);

           resolve(url, {

             basedir,

             //look for SASS and CSS files
             extensions: tradieConfig.style.extensions,

             //allow packages to define a SASS entry file using the "main.scss", "main.sass" or "main.css" keys
             packageFilter(pkg) {
               pkg.main = pkg['main.scss'] || pkg['main.sass'] || pkg['main.css'] || pkg['style'];
               return pkg;
             }

           }, (resolveError, file) => {
             if (resolveError) {
               return done({file: url}); //if we can't resolve it then let webpack resolve it
             } else {

               if (path.extname(file) === '.css') {
                 fs.readFile(file, (readError, data) => {
                   if (readError) {
                     return done(readError);
                   } else {
                     return done({file, contents: data.toString()});
                   }
                 });
               } else {
                 return done({file});
               }

             }
           });
         }
       }
     }
   })
  );

   webpackConfig.module.loaders.push({
     test: extensionsToRegex(tradieConfig.style.extensions),
     loader: ExtractTextPlugin.extract({
       fallbackLoader: 'style-loader',
       loader: [
         `css-loader?-autoprefixer${tradieConfig.optimize ? '' : '&sourceMap'}`,
         `postcss-loader${tradieConfig.optimize ? '' : '?sourceMap'}`,
         `resolve-url-loader${tradieConfig.optimize ? '' : '?sourceMap'}`, //devtool: [inline-]source-map is required for CSS source maps to work
         'sass-loader?sourceMap' //sourceMap required by resolve-url-loader
       ]
     })
   });

   webpackConfig.plugins = webpackConfig.plugins.concat([
     new ExtractTextPlugin({
       //other chunks should have styles in the JS and load the styles automatically onto the page (that way styles make use of code splitting) e.g. https://github.com/facebookincubator/create-react-app/issues/408
       allChunks: false,
       filename
     }),
     new CheckVersionConflictPlugin({
       include: extensionsToRegex(tradieConfig.style.extensions)
     })
   ]);

}
