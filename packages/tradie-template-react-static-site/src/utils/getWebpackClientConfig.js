import fs from 'fs';
import webpack from 'webpack';
import extensionsToRegex from 'ext-to-regex';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import CollectFilesPlugin from 'tradie-webpack-utils/CollectFilesPlugin';
import CachedDllReferencePlugin from 'tradie-webpack-utils/CachedDllReferencePlugin';
import styleExtensions from './styleExtensions';
import scriptExtensions from './scriptExtensions';
import getPaths from './getPaths';
import getEslintClientConfig from './getEslintClientConfig';
import getBabelClientConfig from './getBabelClientConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';

export default options => {
  const paths = getPaths(options.root);
  const optimize = options.optimize;
  const manifest = options.manifest;
  const metadata = options.metadata;

  //TODO: if no client side JS then we need to reload the page on change another way
  if (!metadata.pages.some(pageMeta => pageMeta.clientPath)) {
    return null;
  }

  const config = getWebpackCommonConfig(
    Object.assign({}, options, {
      eslint: getEslintClientConfig(options),
      babel: getBabelClientConfig(options)
    })
  );

  config.entry = {};
  metadata.pages.forEach(pageMeta => {
    if (pageMeta.clientPath) {
      config.entry[pageMeta.chunkName] = pageMeta.clientPath;
    }
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false
    })
  );

  // === load the CSS ===

  const cssLoaders = [
    {
      loader: require.resolve('css-loader'),
      options: {
        modules: false,
        minimize: optimize,
        importLoaders: 1
      }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        plugins: () => [
          autoprefixer({browsers: 'last 2 versions, > 5%, ie >= 11'})
        ]
      }
    }
  ];
  if (optimize) {
    config.module.rules.push({
      test: extensionsToRegex(styleExtensions),
      use: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: cssLoaders
      })
    });

    config.plugins.push(
      new ExtractTextPlugin({
        filename: optimize
          ? 'styles/[name].[contenthash:8].css'
          : 'styles/client.css',
        allChunks: false
      })
    );
  } else {
    config.module.rules.push({
      test: extensionsToRegex(styleExtensions),
      use: [require.resolve('style-loader'), ...cssLoaders]
    });
  }

  // === load the files ===

  config.module.rules.push({
    exclude: extensionsToRegex(
      [].concat(scriptExtensions, styleExtensions, '.json')
    ),
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {
          //always include the original file name for SEO benefits
          name: 'files/[name].[hash:8].[ext]',

          //emit files on the client
          emitFile: true
        }
      }
    ]
  });

  // === reference the DLL ===

  if (fs.existsSync(paths.vendorEntryFile)) {
    config.plugins.push(
      new CachedDllReferencePlugin({
        manifest: paths.vendorManifestFile
      })
    );
  }

  // === collect files ===

  config.plugins.push(
    new CollectFilesPlugin({
      cache: manifest
    })
  );

  // === uglify ===

  if (optimize) {
    //babili + uglify gives better results and uglify is the only way to get react-devtools to be quiet about the bundle not being minified
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        output: {
          comments: false
        },
        sourceMap: true
      })
    );
  }

  return config;
};
