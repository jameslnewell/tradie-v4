'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const mergeWith = require('lodash.mergewith');
const extensionsToRegex = require('ext-to-regex');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ensureTrailingSlash = require('./lib/ensureTrailingSlash');
const WatchMissingNodeModulesPlugin = require('./lib/WatchMissingNodeModulesPlugin');

class WebpackConfigBuilder {

  /**
   * @param   {object}  options
   * @param   {string}  options.root
   * @param   {string}  options.src
   * @param   {string}  options.tmp
   * @param   {string}  options.dest
   * @param   {string}  options.publicPath
   * @param   {boolean} options.optimize
   */
  constructor(options) {
    this.rootDirectory = options.root;
    this.sourceDirectory = options.src;
    this.tempDirectory = options.tmp;
    this.outputDirectory = options.dest;
    this.publicPath = ensureTrailingSlash(options.publicPath);
    this.optimize = options.optimize || false;

    this.webpackConfig = {

      devtool: this.optimize ? false : 'eval',

      context: this.sourceDirectory,

      entry: {},

      output: {
        publicPath: this.publicPath,
        path: this.outputDirectory,

        //use name vs https://github.com/webpack/webpack-dev-server/issues/377#issuecomment-241258405
        filename: this.optimize ? 'scripts/[chunkhash:8].js' : 'scripts/[name].js',
        chunkFilename: this.optimize ? 'scripts/[chunkhash:8]-[id].js' : 'scripts/[name].js',
      },

      resolve: {
        extensions: [],
        plugins: []
      },

      module: {
        loaders: []
      },

      plugins: [

        //enforce case sensitive paths to avoid issues between file systems
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin(path.join(this.rootDirectory, 'node_modules')), //TODO: only do when watching for slight perf increase?

        new webpack.LoaderOptionsPlugin({
          minimize: this.optimize,
          debug: !this.optimize
        })
      ]

    };
  }

  merge(config) {
   return mergeWith(this.webpackConfig, config, (prev, next) => {
     if (Array.isArray(prev)) {
       return prev.concat(next);
     } else {
       return;
     }
   });
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

    if (this.optimize) {

      this.webpackConfig.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }));

      this.webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false
        },
        mangle: {
          screw_ie8: true
        },
        output: {
          comments: false,
          screw_ie8: true
        },
        sourceMap: false
      }));
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
        filename: this.optimize ? 'styles/[contenthash:8].css' : 'styles/[name].css'
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
  configureJSON() {

    this.webpackConfig.resolve.extensions.push('.json');

    this.webpackConfig.module.loaders.push({
      test: /\.json$/,
      loader: 'json-loader'
    });

    return this;
  }

  /**
   * @param {object}          options
   * @param {Array.<string>}  options.extensions
   */
  configureFiles(options) {

    this.webpackConfig.module.loaders.push({
      test: extensionsToRegex(options.extensions),
      loader: 'file-loader',
      query: {name: 'files/[name].[hash:8].[ext]'} //always include the file name for SEO benefits
    });

    return this;
  }

  /**
   * Configure DLL
   */
  configureDLL() {

    const name = this.optimize ? '[name]' : '[name]_[chunkhash]';

    this.webpackConfig.output.library = name;

    this.webpackConfig.plugins.push(new webpack.DllPlugin({
      path: path.join(this.tempDirectory, '[name]-manifest.json'),
      name: name
    }));

    return this;
  }

  configureDLLReference() {
    if (vendors.length > 0) {
      //chose DLLPlugin for long-term-caching based on https://github.com/webpack/webpack/issues/1315
      config.plugins = config.plugins.concat([
        new webpack.DllReferencePlugin({
          context: dest,
          manifest: require(path.join(tmp, 'vendor-manifest.json')) //eslint-disable-line global-require
        })
      ]);
    }
  }

  configureCommonBundle() {
    if (clientBundles.length > 1) {
      config.plugins = config.plugins.concat([
        new webpack.optimize.CommonsChunkPlugin({
          name: 'common',
          filename: 'scripts/[name].[chunkhash:8].js',
          chunks: clientBundles, //exclude modules from the vendor chunk
          minChunks: clientBundles.length //modules must be used across all the chunks to be included
        })
      ]);
    }//TODO: what about for a single page app where require.ensure is used - I want a common stuff for all chunks in the main entry point
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