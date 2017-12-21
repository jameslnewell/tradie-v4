import detectPort from 'detect-port';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import createEmitter from './createEmitter';
import {setImmediate} from 'core-js/library/web/timers';

export default function(config) {
  let compiler;
  let server;
  let port;

  const createCompiler = async () => {
    port = await detectPort(3000);

    compiler = webpack({
      ...config,
      entry: [].concat(
        config.entry, //TODO: support string, array or object
        require.resolve('webpack/hot/dev-server'),
        `${require.resolve('webpack-dev-server/client')}?http://localhost:${port}/`
      ),
      output: {
        ...config.output,
        publicPath: '/'
      },
      plugins: [].concat(config.plugins, new webpack.HotModuleReplacementPlugin())
    });

    return compiler;
  };

  const startCompiling = async ({emitter}) => {
    server = new WebpackDevServer(compiler, {
      contentBase: config.output.path,
      compress: true,
      overlay: true,
      hot: true,
      noInfo: true,
      quiet: true,
      historyApiFallback: true
    });

    server.listen(port, '127.0.0.1', () => {
      emitter.emit('log', {
        level: 'info',
        message: `Started server on http://localhost:${port}`
      });
    });
  };

  const stopCompiling = async () => {
    if (server) {
      server.close();
    }
  };

  return createEmitter(createCompiler, startCompiling, stopCompiling);
}
