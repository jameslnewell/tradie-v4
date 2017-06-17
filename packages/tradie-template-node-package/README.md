# tradie-template-node-package

A [`tradie`](https://www.npmjs.com/package/tradie) template for creating NodeJS packages.

Featuring:

- transpilation with `babel`
- type checking with `flow`
- testing with `jest`

## Installation

```bash
npm install --save-dev tradie-template-node-package
```

## Usage

1. Create the following files:
```
mkdir <prj-name> && cd <prj-name>
vim package.json
vim src/index.js
vim src/index.test.js
```

2. Run build
3. Run test
4. Publish your module

> TODO: create a `create` command

## Commands

### `tradie clean`
### `tradie build [--watch]`
### `tradie test [--watch]`
