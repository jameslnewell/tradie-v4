import CancelablePromise from '../src';

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

const waiting = delay().then(
  exit,
  exit
);

process.stdin.on('data', (data) => {
  waiting.cancel();
});
