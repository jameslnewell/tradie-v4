const process = require('./lib').process;

const processor = process(
  __dirname,
  [
    {
      include: '**/src/**/*.{js,jsx}',
      exclude: ['**/*.test.{js,jsx}', '**/__mocks__/**'],
      process: file =>
        new Promise(resolve =>
          setTimeout(() => {
            console.log('process:', file);
            resolve();
          }, 1000)
        )
    }
  ],
  {
    watch: true,
    complete: files => console.log('complete:', files.length)
  }
);
