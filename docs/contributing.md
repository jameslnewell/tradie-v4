# Contributing

This repo is [`monorepo`](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) managed by [LernaJS](https://lernajs.io).

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [tradie](./packages/tradie) | [![npm](https://img.shields.io/npm/v/tradie.svg)]() | The CLI for running tradie in your project. |
| [tradie-webpack-scripts](./packages/tradie-webpack-scripts) | [![npm](https://img.shields.io/npm/v/tradie-webpack-scripts.svg)]() | Scripts for performing build tasks. Used by the tradie CLI. |
| [tradie-webpack-config](./packages/tradie-webpack-config) | [![npm](https://img.shields.io/npm/v/tradie-webpack-config.svg)]() | Utilities for creating Webpack configuration. Used by the tradie templates. |

## Setup

```bash
npm install         # install the common tools and dependencies
npm run bootstrap   # install the package specific tools and dependencies
```

> Note: Requires Node.js v4 or greater

## Branching

### `master`

The `master` branch will contain the most recent stable release and will have been published to `npm` using the `latest` dist-tag.

### `next`

The `next` branch will contain the most recent alpha release and will have been published to `npm` using the `next` dist-tag. When the next version becomes stable, this branch will be merged into master.

### `add/<feature>` or `fix/<feature>`

These branches will contain all Work In Progress and will be merged into the `master` or `next` branches as appropiate.
