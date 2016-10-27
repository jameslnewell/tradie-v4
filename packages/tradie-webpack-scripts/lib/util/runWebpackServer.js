// const WebpackDevServer = require('webpack-dev-server');

const port = 3000;

/**
 * @param {object} options
 * @param {object} options.publicDir
 * @param {object} options.publicUrl
 * @param {object} compiler
 */
module.exports = (options, compiler) => new Promise((resolve, reject) => {

  //stop the server
  const server = new WebpackDevServer(compiler, {
    quiet: true,
    clientLogLevel: 'none',
    hot: true,
    host: 'localhost',
    https: process.env.HTTPS,
    contentBase: options.publicDir,
    publicPath: options.publicUrl || '/',
    // watchOptions: {
    //   ignored: /node_modules/
    // }
  });

  //start the server
  server.listen(port, err => {

    if (err) {
      console.error(err);
      reject();
      return;
    }

    // clearConsole();
    // console.log();
    // console.log(('Starting the development server...'));
    // console.log();
    // openBrowser(protocol + '://' + host + ':' + port + '/');

  });

  //stop serving and exit when the user presses CTL-C
  process.on('SIGINT', () => {
    server.close(() => {
      resolve(); //FIXME: not being called until reload after first reload
    });
  });

});
