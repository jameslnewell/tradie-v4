# @tradie/node-package-template

[![npm](https://img.shields.io/npm/v/@tradie/node-package-template.svg)]()
[![Travis](https://img.shields.io/travis/jameslnewell/tradie-v4.svg)]()
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A [`tradie`](https://www.npmjs.com/package/tradie) template for creating packages that run on NodeJS.

Featuring:

- linting with `eslint`
- type checking with `flow`
- transpilation with `babel`
- testing with `jest`

## Usage

1. Create a new package:

    `npx --package @tradie/node-package-template tradie create`

2. Build the files:

    `yarn run build`

3. Run the tests:

    `yarn run test`

4. Publish the package:

    `yarn publish`

## Commands

### `tradie create`

Create the package files.

### `tradie clean`

Remove generated files.

Will remove files matching `lib/**` and `coverage/**`.

### `tradie lint`

Lint source and test files.

### `tradie build [--watch]`

Lint and transpile source files.

Will lint and transpile source files matching `src/**/*.{js,jsx}` and write the result to `lib/`. Will copy Flow types to `lib/`.

Will ignore test files, fixtures and mocks matching `{src,test}/**/*.test.{js,jsx}`, `{src/test}/**/__mocks__/` or `{src/test}/**/__fixtures__/`.

### `tradie test [--watch] [--coverage]`

Run test files.

Will run test files matching `{src,test}/**/*.test.{js,jsx}`.

## How to

### Setup Flowtype

1. Create the config file:

    - `.flowconfig`
    ```
    [ignore]

    # ignore transpiled code
    <PROJECT_ROOT>/lib

    ```

    > You can learn more about configuring Flow [here](https://flow.org/en/docs/config/).

2. Install the types for `jest`:

    `flow-typed install jest@^20 --flowVersion 0.48.0`

    > You can learn more about installing Flow types [here](https://github.com/flowtype/flow-typed#readme).

3. Annotate your files:

    - `src/index.js`
    ```js
    // @flow
    ...
    ```

    - `src/index.test.js`
    ```js
    // @flow
    ...
    ```

    > You can learn more about writing code for Flow [here](https://flow.org/en/docs/usage/#toc-write-flow-code).

### Write tests

1. Create a test file and write some assertions

    - `src/index.test.js`
    ```js

    describe('lame example()', () => {
      it('should pass', () => {
        expect(true).toBeTruthy();
      });
    });

    ```

    > You can learn more about writing assertions with Jest [here](https://facebook.github.io/jest/docs/expect.html#content).

    > Jest provides [mock functions](https://facebook.github.io/jest/docs/mock-function-api.html#content) and [manual mock functions](https://facebook.github.io/jest/docs/manual-mocks.html) which are worth learning!

#### Customising the test environment

*Occasionally* you'll need to run some code to setup your test environment before running your tests. Jest will try running `src/_.test.js` and `test/_.test.js` before it runs your tests. You can place any necessary test setup in here.

e.g.

```js
import {shallow} from 'enzyme';

//allow global access to `shallow()` in test files
// to avoid `import`ing it in every file
global.shallow = shallow;

```

### Include other ty[es of files

1. Create a new directory for your files

    e.g. `files/`

2. Reference your files from your sources using `require.resolve()`

    e.g. `fs.readFileSync(require.resolve('../files/data.txt'));`

3. Update the `files` key in your `package.json` so NPM publishes the files in the package

    e.g. `"files": ["lib", "files"],`

