/* tslint:disable member-ordering */

export type CancelFunction = () => void;

export default class CancelablePromise<T> implements PromiseLike<T> {
  private isCancelled: boolean = false;
  private isPending: boolean = true;
  private internalPromise: Promise<T>;
  private cancelFunction: CancelFunction | void = undefined;

  public static resolve(): CancelablePromise<void>;
  public static resolve<T>(value: T | PromiseLike<T>): CancelablePromise<T>;
  public static resolve<T>(value?: T): CancelablePromise<T | void> {
    return new CancelablePromise(resolve => resolve(value));
  }

  public static reject<T>(reason: any): CancelablePromise<T>;
  public static reject(reason: any): CancelablePromise<any>;
  public static reject<T>(reason: any): CancelablePromise<T | any> {
    return new CancelablePromise((resolve, reject) => reject(reason));
  }

  public static all<T>(values: Array<T | PromiseLike<T>>): CancelablePromise<T[]>;
  public static all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): CancelablePromise<[T1, T2]>;
  public static all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): CancelablePromise<[T1, T2, T3]>;
  public static all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): CancelablePromise<[T1, T2, T3, T4]>;
  public static all(values: Array<any | PromiseLike<any>>): CancelablePromise<any[]> {
    return new CancelablePromise((resolve, reject) => {
      Promise.all(values).then(resolve, reject);
      return () => values.forEach(value => {
        if (value && typeof value.cancel === 'function') {
          value.cancel();
        }
      })
    });
  }

  // TODO: calling resolve with no value should result in CancelablePromise<void>
  constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => CancelFunction | void) {
    this.internalPromise = new Promise((resolve, reject) => {
      const onResolve = (value?: T | PromiseLike<T>) => {
        this.isPending = false;
        resolve(value);
      };
      const onReject = (reason?: any) => {
        this.isPending = false;
        reject(reason);
      };
      this.cancelFunction = executor(onResolve, onReject);
    });
  }

  public cancel(): void {
    if (!this.isPending || this.isCancelled) {
      return;
    }
    this.isCancelled = true;
    if (this.cancelFunction) {
      this.cancelFunction();
    }
  }

  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): CancelablePromise<TResult1 | TResult2> {
    return new CancelablePromise((resolve, reject) => {
      this.internalPromise.then(onfulfilled, onrejected).then(resolve, reject);
      return () => this.cancel();
    });
  }

  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): CancelablePromise<T | TResult> {
    return new CancelablePromise((resolve, reject) => {
      this.internalPromise.catch(onrejected).catch(reject);
      return () => this.cancel();
    });
  }

}
