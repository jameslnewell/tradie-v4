# Contributing

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repo is a
[`monorepo`](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)
managed by [LernaJS](https://lernajs.io).

`tradie` is
[dog-fooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food). That
means `tradie` is built using a previously published version of
[`@tradie/node-scripts`](../packages/scripts/node/README.md).

`tradie` requires Node.js v4 or greater and the [Yarn](https://yarnpkg.com/en/)
package manager.

## Packages

| Package                        | Version                                                  | Description                                 |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------- |
| [@tradie/cli](../packages/cli) | [![npm](https://img.shields.io/npm/v/@tradie/cli.svg)]() | The CLI for running tradie in your project. |

### Scripts

| Package                                                       | Version                                                           | Description                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| [@tradie/node-scripts](../packages/scripts/node-scripts)      | [![npm](https://img.shields.io/npm/v/@tradie/node-scripts.svg)]() | Scripts for creating a NodeJS package.    |
| [@tradie/component-scripts](../packages/scripts/node-scripts) | [![npm](https://img.shields.io/npm/v/@tradie/node-scripts.svg)]() | Scripts for creating a component package. |

### Utilities

| Package                                            | Version                                                            | Description                                   |
| -------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| [@tradie/babel-utils](../packages/utils/babel)     | [![npm](https://img.shields.io/npm/v/@tradie/babel-utils.svg)]()   | Utilities for transforming code with `babel`. |
| [@tradie/cli-utils](../packages/utils/cli)         | [![npm](https://img.shields.io/npm/v/@tradie/cli-utils.svg)]()     | Utilities for working with the CLI.           |
| [@tradie/file-utils](../packages/utils/file)       | [![npm](https://img.shields.io/npm/v/@tradie/file-utils.svg)]()    | Utilities for working with the file system.   |
| [@tradie/flow-utils](../packages/utils/flow)       | [![npm](https://img.shields.io/npm/v/@tradie/flow-utils.svg)]()    | Utilities for checking code with `flowtype`.  |
| [@tradie/jest-utils](../packages/utils/jest)       | [![npm](https://img.shields.io/npm/v/@tradie/jest-utils.svg)]()    | Utilities for running tests with `jest`.      |
| [@tradie/tslint-utils](../packages/utils/jest)     | [![npm](https://img.shields.io/npm/v/@tradie/jest-utils.svg)]()    | Utilities for linting Typescript files.       |
| [@tradie/typescript-utils](../packages/utils/jest) | [![npm](https://img.shields.io/npm/v/@tradie/jest-utils.svg)]()    | Utilities for transpiling Typescript files.   |
| [@tradie/webpack-utils](../packages/utils/webpack) | [![npm](https://img.shields.io/npm/v/@tradie/webpack-utils.svg)]() | Utilities for creating Webpack configuration. |

### Deprecated

| Package                                                                            | Version                                                                        | Description                                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [tradie-template-react-static-site](../packages/tradie-template-react-static-site) | [![npm](https://img.shields.io/npm/v/tradie-template-react-static-site.svg)]() | Template for creating static sites rendered at build-time with React. |
| [tradie-webpack-config](../packages/tradie-webpack-config)                         | [![npm](https://img.shields.io/npm/v/tradie-webpack-config.svg)]()             | Utilities for creating Webpack configuration.                         |
| [tradie-webpack-scripts](../packages/tradie-webpack-scripts)                       | [![npm](https://img.shields.io/npm/v/tradie-webpack-scripts.svg)]()            | Scripts for performing frontendy build tasks.                         |

## Setup

```bash
yarn                 # install dependencies
yarn run link        # link the previous binary
yarn run build       # build all the packages
yarn run test        # test all the packages
```

## Developing

### Within a single package

The package is built using a previously published version of
[`@tradie/node-scripts`](./packages/node-scripts/README.md).

```bash
yarn run watch       # build the package and watch for changes
yarn run test        # test the package
```

## Committing

This repo automatically determines version numbers using
[conventional-commits](https://conventionalcommits.org/). For this to work,
commit messages must adhere to the spec.
[commitizen](https://github.com/commitizen/cz-cli) is setup for convenience.

```bash
//make a change, then
git add .
yarn run commit
```

## Branching

### `master`

The `master` branch will contain the most recent stable release and will have
been published to `npm` using the `latest` dist-tag.

### `next`

The `next` branch will contain the most recent alpha release and will have been
published to `npm` using the `next` dist-tag. When the next version becomes
stable, this branch will be merged into master.

### `add/<feature>` or `fix/<feature>`

These branches will contain all Work In Progress and will be merged into the
`master` or `next` branches as appropiate.

## Releasing

## latest

Use `yarn run publish -- --conventional-commits`.

## next

Use `yarn run publish -- --canary --exact`.

* `--canary` adds a unique string on the end of the version without bumping the
  version
* `--exact` - because the `canary` versions aren't ordered, we need to use
  `exact` versions
