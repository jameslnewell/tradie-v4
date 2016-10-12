'use strict';
let sum = require('./sum');

console.log(sum(1, 2));

setInterval(() => {
  console.log('.');
}, 2000);

if (module.hot) {
  console.log('HMR enabled')
  module.hot.accept('./sum', () => {
    console.log('accepted');
    sum = require('./sum');
    console.log(sum(1, 2));
  });
}