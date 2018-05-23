import { EventEmitter } from 'events';

declare module 'chokidar' {

  export let __watcher: EventEmitter;

}
