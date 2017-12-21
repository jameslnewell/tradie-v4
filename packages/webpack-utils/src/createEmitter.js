import {EventEmitter} from 'events';
import formatMessage from './formatMessage';

export default function(createCompiler, startCompiling, stopCompiling) {
  let resolve;
  let reject;
  let watching = false;

  const emitter = new EventEmitter();
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  process.nextTick(async () => {
    //create the compiler and observe events
    const compiler = await createCompiler({emitter});

    compiler.plugin('run', (compilerOrWatcher, next) => {
      emitter.emit('started');
      next();
    });

    compiler.plugin('watch-run', (compilerOrWatcher, next) => {
      watching = true;
      emitter.emit('started');
      next();
    });

    compiler.plugin('watch-close', () => {
      emitter.emit('stopped');
      resolve();
    });

    compiler.plugin('failed', error => {
      emitter.emit('error', error);
      reject(error);
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

      if (!watching) {
        emitter.emit('stopped');
      }
    });

    // compiler.plugin('invalid', (file, time) => {
    // console.log(`modified: ${file} at ${time}`);
    // });

    // start the compiler
    await startCompiling({emitter});
  });

  return {
    stop() {
      stopCompiling();
      return this;
    },

    on(type, listener) {
      emitter.on(type, listener);
      return this;
    },

    off(type, listener) {
      emitter.on(type, listener);
      return this;
    },

    then(fn1, fn2) {
      return promise.then(fn1, fn2);
    },

    catch(fn) {
      return promise.catch(fn);
    }
  };
}
