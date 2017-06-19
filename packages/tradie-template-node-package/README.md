# tradie-template-node-package

A [`tradie`](https://www.npmjs.com/package/tradie) template for creating NodeJS packages.

Featuring:

- transpilation with `babel`
- linting with `eslint`
- type checking with `flow`
- testing with `jest`

## Installation

```bash
npm install --save-dev tradie-template-node-package
```

## Usage

> Browse the [example project](https://github.com/jameslnewell/tradie-v4/tree/separate-builder/packages/tradie-template-node-package-example).

1. Create the project files:
```
mkdir <prj-name> && cd <prj-name>
vim package.json
vim src/index.js
vim src/index.test.js
```

2. Run the build
3. Run the tests
4. Publish your module

## Commands

### `tradie clean`

Remove transpiled files.

### `tradie build [--watch]`

Transpile source files, with the option to re-transpile source files when the source files change.

### `tradie test [--watch] [--coverage]`

Test source files, with the option to re-test source files when the source files change.

## TODO

- create a `tradie create` command