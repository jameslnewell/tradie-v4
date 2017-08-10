import {EventEmitter} from 'events';
import detectPort from 'detect-port';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import emit from './emit';

export default function(config) {
  const emitter = new EventEmitter();

  if (!config) {
    return emitter;
  }

  detectPort(3000).then(port => {
    const compiler = webpack({
      ...config,
      entry: [].concat(
        config.entry, //TODO: support string, array or object
        require.resolve('webpack/hot/dev-server'),
        `${require.resolve(
          'webpack-dev-server/client'
        )}?http://localhost:${port}/`
      ),
      output: {
        ...config.output,
        publicPath: '/'
      },
      plugins: [].concat(
        config.plugins,
        new webpack.HotModuleReplacementPlugin()
      )
    });

    emit(emitter, compiler);

    const server = new WebpackDevServer(compiler, {
      contentBase: config.output.path,
      compress: true,
      overlay: true,
      hot: true,
      noInfo: true,
      quiet: true,
      historyApiFallback: true
    });

    server.listen(port, () => {
      emitter.emit('log', {
        level: 'info',
        message: `Started server on http://localhost:${port}`
      });
    });

    emitter.close = () => server.close();
  });

  return emitter;
}
