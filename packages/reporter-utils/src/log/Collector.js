//@flow
import {type Data, type Record} from './types';

export default class Collector {
  logs: Record[] = [];

  clear() {
    this.logs = [];
    return this;
  }

  log(log: Record) {
    this.logs.push({
      priority: 0,
      ...log
    });
    return this;
  }

  info(data: Data) {
    this.log({level: 'info', ...data});
    return this;
  }

  warn(data: Data) {
    this.log({level: 'warn', ...data});
    return this;
  }

  error(data: Data) {
    this.log({level: 'error', ...data});
    return this;
  }

  filter(...args: any) {
    return this.logs.filter(...args);
  }
}
