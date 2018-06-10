import sum from '../src/index';

async function foobar() {
  await Promise.resolve();
  console.log('sum: 1+1 =', sum(1, 1));
}

foobar();
