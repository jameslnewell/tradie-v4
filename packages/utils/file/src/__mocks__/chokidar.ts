import { EventEmitter } from 'events';
export * from 'chokidar';
import * as chokidar from 'chokidar';

const emitter = new EventEmitter();

jest.spyOn(chokidar, 'watch').mockReturnValue({
  ...emitter,
  close: jest.fn()
});

export { emitter as __watcher };
