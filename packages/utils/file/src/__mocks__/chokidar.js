import {EventEmitter} from 'events';
const chokidar = jest.genMockFromModule('chokidar');

const emitter = new EventEmitter();
emitter.close = jest.fn();

chokidar.__watcher = emitter;

chokidar.watch = function watch() {
  return chokidar.__watcher;
};

export default chokidar;
