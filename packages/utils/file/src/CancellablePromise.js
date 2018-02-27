//@flow

// TODO: extract this into its own lib

const noop = () => {};

export default class CancellablePromise<T> {
  _isCancelled: boolean = false;
  _isPending: boolean = true;

  _promise: Promise<T>;
  _cancelFn: Function = noop;

  static resolve(val) {
    return new CancellablePromise(resolve => {
      resolve(val);
    });
  }

  static reject(err) {
    return new CancellablePromise((resolve, reject) => {
      reject(err);
    });
  }

  constructor(fn: Function) {
    this._promise = new Promise((resolve, reject) => {
      const onResolve = val => {
        this._isPending = false;
        resolve(val);
      };
      const onReject = err => {
        this._isPending = false;
        reject(err);
      };
      const onCancel = cancel => {
        this._cancelFn = cancel;
      };
      fn(onResolve, onReject, onCancel);
    });
  }

  cancel(): void {
    if (!this._isPending || this._canceled) {
      return;
    }
    this._isCancelled = true;
    this._cancelFn();
  }

  then(fn1: Function, fn2: Function): CancellablePromise<T> {
    return new CancellablePromise((resolve, reject, onCancel) => {
      this._promise.then(fn1, fn2).then(resolve, reject);

      onCancel(() => this.cancel());
    });
  }

  catch(fn: Function): CancellablePromise<T> {
    return new CancellablePromise((resolve, reject, onCancel) => {
      this._promise.catch(fn).then(resolve, reject);

      onCancel(() => this.cancel());
    });
  }
}
