import * as chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { watch } from './watch';


declare module 'chokidar' {
  export let __watcher: EventEmitter;
}


describe('watcher()', () => {
  it('should call created() with a file', () => {
    expect.assertions(1);

    const watching = watch('/users/dev/math', {
      created: file => {
        expect(file).toEqual('/users/dev/math/src/sum.js');
        watching.cancel();
      }
    });

    chokidar.__watcher.emit('add', 'src/sum.js');

    return watching;
  });

  it('should call updated() with a file', () => {
    expect.assertions(1);

    const watching = watch('/users/dev/math', {
      updated: file => {
        expect(file).toEqual('/users/dev/math/src/sum.js');
        watching.cancel();
      }
    });

    chokidar.__watcher.emit('change', 'src/sum.js');

    return watching;
  });

  it('should call deleted() with a file', () => {
    expect.assertions(1);

    const watching = watch('/users/dev/math', {
      deleted: file => {
        expect(file).toEqual('/users/dev/math/src/sum.js');
        watching.cancel();
      }
    });

    chokidar.__watcher.emit('unlink', 'src/sum.js');

    return watching;
  });
});
