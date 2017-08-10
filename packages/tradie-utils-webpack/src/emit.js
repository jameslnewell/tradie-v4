import formatMessage from './formatMessage';

export default function(emitter, compiler) {
  compiler.plugin(['run', 'watch-run'], (compilerOrWatcher, callback) => {
    emitter.emit('started');
    callback();
  });

  compiler.plugin('done', stats => {
    const cwd = compiler.options.context;
    const json = stats.toJson();

    json.errors.forEach(error => {
      const {file, message} = formatMessage(error, {cwd});
      emitter.emit('log', {level: 'error', file, message});
    });

    json.warnings.forEach(warning => {
      const {file, message} = formatMessage(warning, {cwd});
      emitter.emit('log', {level: 'warn', file, message});
    });

    emitter.emit('finished');
  });

  compiler.plugin('failed', error => {
    emitter.emit('error', error);
  });

  compiler.plugin('invalid', (file, time) => {
    console.log(`modified: ${file} at ${time}`);
  });
}
