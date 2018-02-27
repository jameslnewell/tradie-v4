//@flow
import CancellablePromise from './CancellablePromise';

describe('CancellablePromise', () => {
  it('should resolve when .cancel() is called', () => {
    const promise = new CancellablePromise((resolve, reject, onCancel) => {
      const timeout = setTimeout(reject, 1000);
      onCancel(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
    promise.cancel();
    return expect(promise).resolves.toBeUndefined();
  });

  it('should reject when .cancel() is not called', () => {
    const promise = new CancellablePromise((resolve, reject, onCancel) => {
      const timeout = setTimeout(reject, 1000);
      onCancel(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
    return expect(promise).rejects.toBeUndefined();
  });

  it('should reject when .cancel() is called', () => {
    const promise = new CancellablePromise((resolve, reject, onCancel) => {
      const timeout = setTimeout(resolve, 1000);
      onCancel(() => {
        clearTimeout(timeout);
        reject();
      });
    });
    promise.cancel();
    return expect(promise).rejects.toBeUndefined();
  });

  it('should resolve when .cancel() is not called', () => {
    const promise = new CancellablePromise((resolve, reject, onCancel) => {
      const timeout = setTimeout(resolve, 1000);
      onCancel(() => {
        clearTimeout(timeout);
        reject();
      });
    });
    return expect(promise).resolves.toBeUndefined();
  });

  it('should chain .cancel() when .then() is called', () => {
    const promise = new CancellablePromise(() => {});

    //chain the promise
    const chain = promise.then(() => {}, () => {});

    // expect .cancel() to still be accessible
    expect(chain.cancel).toEqual(expect.any(Function));
  });

  it('should chain .cancel() when .catch() is called', () => {
    const promise = new CancellablePromise(() => {});

    //chain the promise
    const chain = promise.catch(() => {});

    // expect .cancel() to still be accessible
    expect(chain.cancel).toEqual(expect.any(Function));
  });
});
