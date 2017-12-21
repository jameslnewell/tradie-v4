// @flow

export type Options = {
  modules: 'cjs' | 'esm',
  optimize: boolean
};

function common({modules, optimize}: Options) {
  const options = {
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          modules: modules === 'cjs' ? 'commonjs' : false,
          useBuiltIns: 'usage',
          targets: {
            browsers: ['last 2 versions', 'ie >= 11']
          }
        }
      ],
      [
        require.resolve('babel-preset-react')
        // {
        //   development: !optimize
        // }
      ],
      require.resolve('babel-preset-flow') // TODO: conditionally include
    ],
    plugins: [
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-object-rest-spread')
    ]
  };

  if (optimize) {
    options.plugins.push(require.resolve('babel-plugin-transform-react-constant-elements'));
  } else {
    options.plugins.push(require.resolve('babel-plugin-transform-react-jsx-self'));
    options.plugins.push(require.resolve('babel-plugin-transform-react-jsx-source'));
  }

  return options;
}

export function cjs() {
  return common({modules: 'cjs', optimize: true});
}

export function esm() {
  return common({modules: 'esm', optimize: true});
}

export function example({optimize}: {optimize: boolean}) {
  return common({modules: 'cjs', optimize});
}

export function test() {
  return common({modules: 'cjs', optimize: false});
}
