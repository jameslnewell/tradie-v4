# Contributing

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repo is a [`monorepo`](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) managed by [LernaJS](https://lernajs.io).

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [tradie](../packages/tradie) | [![npm](https://img.shields.io/npm/v/tradie.svg)]() | The CLI for running tradie in your project. |

## Templates

| Package | Version | Description |
|---------|---------|-------------|
| [tradie-template-node-package](../packages/tradie-template-node-package) | [![npm](https://img.shields.io/npm/v/tradie-template-node-package.svg)]() | Template for creating a NodeJS package. |
| [tradie-template-react--site](../packages/tradie-template-react-site) | [![npm](https://img.shields.io/npm/v/tradie-template-react-site.svg)]() | Template for creating static sites rendered at build-time with React. |
| [tradie-template-react-app](../packages/tradie-template-react-app) | [![npm](https://img.shields.io/npm/v/tradie-template-react-app.svg)]() | Template for creating a universaljs app rendered at run-time with React. |

## Scripts

| Package | Version | Description |
|---------|---------|-------------|
| [tradie-template-node-package](../packages/tradie-template-template-node-package) | [![npm](https://img.shields.io/npm/v/tradie-template-template-nodejs-package.svg)]() | Scripts for creating a NodeJS package. |

## Utilities

| Package | Version | Description |
|---------|---------|-------------|
| [tradie-utils-babel](../packages/tradie-utils-babel) | [![npm](https://img.shields.io/npm/v/tradie-utils-babel.svg)]() | Utilities for transforming code with `babel`. |
| [tradie-utils-cli](../packages/tradie-utils-cli) | [![npm](https://img.shields.io/npm/v/tradie-utils-cli.svg)]() | Utilities for working with the CLI. |
| [tradie-utils-file](../packages/tradie-utils-file) | [![npm](https://img.shields.io/npm/v/tradie-utils-file.svg)]() | Utilities for working with the file system. |
| [tradie-utils-flow](../packages/tradie-utils-flow) | [![npm](https://img.shields.io/npm/v/tradie-utils-flow.svg)]() | Utilities for checking code with `flowtype`. |
| [tradie-utils-jest](../packages/tradie-utils-jest) | [![npm](https://img.shields.io/npm/v/tradie-utils-jest.svg)]() | Utilities for running tests with `jest`. |
| [tradie-webpack-utils](../packages/tradie-webpack-utils) | [![npm](https://img.shields.io/npm/v/tradie-webpack-utils.svg)]() | Utilities for creating Webpack configuration. |

## Deprecated

| Package | Version | Description |
|---------|---------|-------------|
| [tradie-template-react--site](../packages/tradie-template-react-static-site) | [![npm](https://img.shields.io/npm/v/tradie-template-react-static-site.svg)]() | Template for creating static sites rendered at build-time with React. |
| [tradie-webpack-config](../packages/tradie-webpack-config) | [![npm](https://img.shields.io/npm/v/tradie-webpack-config.svg)]() | Utilities for creating Webpack configuration. |
| [tradie-webpack-scripts](../packages/tradie-webpack-scripts) | [![npm](https://img.shields.io/npm/v/tradie-webpack-scripts.svg)]() | Scripts for performing frontendy build tasks. |


## Setup

```bash
yarn install         # install the common tools and dependencies
yarn run bootstrap   # install the package specific tools and dependencies
```

> Note: Requires Node.js v4 or greater

## Committing

This repo automatically determines version numbers using [conventional-commits](https://conventionalcommits.org/). For this to work, commit messages must adhere to the spec. [commitizen](https://github.com/commitizen/cz-cli) is setup for convenience.

```bash
//make a change, then
git add .
yarn run commit
```

## Branching

### `master`

The `master` branch will contain the most recent stable release and will have been published to `npm` using the `latest` dist-tag.

### `next`

The `next` branch will contain the most recent alpha release and will have been published to `npm` using the `next` dist-tag. When the next version becomes stable, this branch will be merged into master.

### `add/<feature>` or `fix/<feature>`

These branches will contain all Work In Progress and will be merged into the `master` or `next` branches as appropiate.

