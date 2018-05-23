# @jameslnewell/cancelable-promise

A cancelable promise implementation.

##### Why?

Unlike other libraries:

* its your choice whether promises are resolved OR rejected
* `.cancel()` is chainable e.g. `promise.then(...).cancel()`

## Installation

```
yarn add @jameslnewell/cancelable-promise
```

## Usage

```typescript
import CancelablePromise from '@jameslnewell/cancelable-promise';

const start = Date.now();

function delay() {
  return new CancelablePromise((resolve, reject) => {
    const timeout = setTimeout(resolve, 10000);
    return () => {
      clearTimeout(timeout);
      resolve();
    };
  });
}

function exit() {
  process.stdin.end();
  const finish = Date.now();
  const elapsed = (finish - start) / 1000;
  console.log(`Waited ${elapsed} seconds.`);
}

console.log('Waiting 10s before exiting. Press RETURN to exit now.');

const waiting = delay().then(exit, exit);

process.stdin.on('data', data => {
  waiting.cancel();
});
```
