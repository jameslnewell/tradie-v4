# tradie-template-node-package

A [`tradie`](https://www.npmjs.com/package/tradie) template for creating NodeJS packages.

Featuring:

- linting with `eslint`
- type checking with `flow`
- transpilation with `babel`
- testing with `jest`

## Installation

```bash
npm install --save-dev tradie-template-node-package
```

## Usage

> Take a look at an [example project](https://github.com/jameslnewell/tradie-v4/tree/separate-builder/packages/tradie-template-node-package-example).

1. Create some files:

  - `package.json`
```json
{
  "name": "my-node-package",
  "main": "lib/index.js",
  "files": ["lib"],
  "devDependencies": {
    "tradie-template-node-package": "^1.0.0"
  },
  "scripts": {
    "lint": "tradie lint",
    "build": "tradie build",
    "watch": "tradie build --watch",
    "test": "tradie test",
    "prepublish": "npm run lint && npm run build && npm run test"
  }
}
```
  - `src/index.js`
```js

export default function() {
  return true;
}

```
  - `src/index.test.js`
```js
import isEverythingAwesome from '.';

describe('isEverythingAwesome()', () => {
  it('should return true', () => {
    expect(isEverythingAwesome()).toBeTruthy();
  });
});

```

2. Build the files
  
    `yarn run build`

3. Run the tests

    `yarn run test`

4. Publish the package

    `yarn publish`

## Commands

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

## How To

### Setting up Flow
- Create `.flowconfig`
- `flowtyped install jest --flowVersion 0.48.0`

### Writing tests
- see `jest` documentation for assertions and mocks
- setup file
