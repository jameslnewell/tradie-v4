'use strict';
const extensionsToRegex = require('ext-to-regex');

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

class WebpackConfigBuilder {

  /**
   * @param   {object} config
   * @param   {string} config.root
   * @param   {string} config.src
   * @param   {string} config.tmp
   * @param   {string} config.dest
   */
  constructor(config) {
    this.rootDirectory = config.root;
    this.sourceDirectory = config.src;
    this.tempDirectory = config.tmp;
    this.outputDirectory = config.dest;
    this.webpackConfig = {

      context: this.sourceDirectory,

      entry: {},

      output: {
        path: this.outputDirectory,
        filename: '[name].js'
      },

      resolve: {
        extensions: [],
        plugins: []
      },

      module: {
        loaders: []
      },

      plugins: []

    };
  }

  /**
   * Configure Eslint
   * @param {object}          options
   * @param {object}          options.eslint
   * @param {Array.<string>}  options.extensions
   */
  configureEslint(options) {

    this.webpackConfig.module.loaders.push({
      enforce: 'pre',
      test: extensionsToRegex(options.extensions),
      include: this.sourceDirectory,
      loader: 'eslint-loader?'+JSON.stringify({
        baseConfig: options.eslint,
        useEslintrc: false
      })
    });

  }

  /**
   * Configure Babel
   * @param {object}          options
   * @param {object}          options.babel
   * @param {Array.<string>}  options.extensions
   */
  configureBabel(options) {

    this.webpackConfig.module.loaders.push({
      test: extensionsToRegex(options.extensions),
      include: this.sourceDirectory,
      loader: 'babel-loader',
      query: Object.assign({}, options.babel, {
        babelrc: false,
        cacheDirectory: this.tempDirectory
      })
    });

    return this;
  }

  /**
   * Configure scripts
   */
  configureScripts(options) {

    this.webpackConfig.resolve.extensions = this.webpackConfig.resolve.extensions.concat(options.extensions);

    if (Object.keys(options.eslint).length) {
      this.configureEslint({
        eslint: options.eslint,
        extensions: options.extensions
      });
    }

    if (Object.keys(options.babel).length) {
      this.configureBabel({
        babel: options.babel,
        extensions: options.extensions
      });
    }

  }

  // ===================================================================================================================
  // STYLES
  // ===================================================================================================================

  /**
   * Ignore styles
   * @param {object}          options
   * @param {Array.<string>}  options.extensions
   */
  ignoreStyles(options) {

    this.webpackConfig.module.loaders.push({
      test: extensionsToRegex(options.extensions),
      include: this.sourceDirectory,
      loader: 'null-loader'
    });

  }

  /**
   * Configure styles
   * @param {object}          options
   * @param {boolean}         options.extract
   * @param {Array.<string>}  options.extensions
   */
  configureStyles(options) {

    const resolve = require('resolve');
    const autoprefixer = require('autoprefixer');

    //configure the style filename
    let filename = this.optimize ? '[name].[contenthash].css' : '[name].css';
    if (options.outputFilename) {
      filename = options.outputFilename;
    }

    this.webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        test: extensionsToRegex(options.extensions),
        options: {

          //webpack props required by loaders https://github.com/bholloway/resolve-url-loader/issues/33#issuecomment-249522569
          context: this.sourceDirectory,
          output: {
            path: this.outputDirectory
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
                extensions: options.extensions,

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

    const loaders = [
      `css-loader?-autoprefixer${this.optimize ? '' : '&sourceMap'}`,
      `postcss-loader${this.optimize ? '' : '?sourceMap'}`,
      `resolve-url-loader${this.optimize ? '' : '?sourceMap'}`, //devtool: [inline-]source-map is required for CSS source maps to work in the browser
      'sass-loader?sourceMap' //sourceMap is required by resolve-url-loader
    ];

    if (options.extract) {

      const ExtractTextPlugin = require('extract-text-webpack-plugin');

      this.webpackConfig.module.loaders.push({
        test: extensionsToRegex(options.extensions),
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: loaders
        })
      });

      this.webpackConfig.plugins.push(new ExtractTextPlugin({
        //other chunks should have styles in the JS and load the styles automatically onto the page (that way styles make use of code splitting) e.g. https://github.com/facebookincubator/create-react-app/issues/408
        allChunks: false,
        filename
      }));

    } else {

      this.webpackConfig.module.loaders.push({
        test: extensionsToRegex(options.extensions),
        loaders: ['style-loader'].concat(loaders)
      });

    }

    // const CheckVersionConflictPlugin = require('./CheckVersionConflictPlugin');
    // new CheckVersionConflictPlugin({
    //   include: extensionsToRegex(tradieConfig.style.extensions)
    // })

  }

  /**
   * Configure JSON
   */
  configureJson() {

    this.webpackConfig.resolve.extensions.push('.json');

    this.webpackConfig.module.loaders.push({
      test: /\.json$/,
      loader: 'json-loader'
    });

    return this;
  }

  plugin(plugin) {
    this.webpackConfig.plugins.push(plugin);
    return this;
  }

  toObject() {
    return this.webpackConfig;
  }

}


module.exports = WebpackConfigBuilder;