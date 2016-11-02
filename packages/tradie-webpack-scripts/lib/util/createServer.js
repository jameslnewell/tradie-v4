/* @flow weak */
'use strict';
const connect = require('connect');
const detectPort = require('detect-port');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');

module.exports = options => {

  let server;
  const app = connect();

  //setup the server
  app
    .use(serveStatic('./dist'))
    .use(serveIndex('./dist'))
  ;

  //if there is a client bundle
  let webpackDevMiddleware;
  let webpackHotMiddleware;
  const clientConfig = options.webpack.client;
  // if (clientConfig) {
  //   console.log('configuring the client');
  //   configureClientHMR(clientConfig);
  //   const compiler = webpack(clientConfig);
  //
  //   reporter.observe(compiler);
  //
  //   webpackDevMiddleware = createWebpackDevMiddleware(compiler, {
  //
  //   });
  //
  //   webpackHotMiddleware = createWebpackHotMiddleware(compiler, {
  //     // log: console.log
  //   });
  //
  //   app
  //     .use(webpackDevMiddleware)
  //     .use(webpackHotMiddleware)
  //   ;
  //
  // }

  //start the server on a free port
  detectPort(3000)
    .then(port => {
      server = app.listen(port, (err) => {
        if (err) return reject(err);
        console.log(chalk.blue(`Server running at http://localhost:${port}`));
      });
    })
    .catch(reject)
  ;

  //stop serving and exit when the user presses CTL-C
  process.on('SIGINT', () => {
    console.log('CTL-C');
    Promise.all([

      //stop the webpack-dev-middleware
      new Promise((resolve, reject) => {
        console.log('has middleware?');
        if (webpackDevMiddleware) {
          console.log('closing middleware');
          webpackDevMiddleware.close(error => {
            console.log('closed middleware', error);
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }
      }),

      //stop the server
      new Promise((resolve, reject) => {
        console.log('has server?');
        if (server) {
          console.log('closing server', server.close);
          server.close(error => {
            console.log('closed server', error);
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }
      })

    ])
      .then(resolve, reject)
    ;
    console.log('tick');
  });

};