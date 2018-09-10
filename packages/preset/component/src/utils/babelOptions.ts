
export function cjs() {
  return {
    babelrc: false,
    sourceMaps: true,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: 'commonjs',
          useBuiltIns: 'usage'
        }
      ],
      require.resolve('@babel/preset-typescript')
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties')
    ]
  };
}

export function esm() {
  return {
    babelrc: false,
    sourceMaps: true,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: false,
          useBuiltIns: 'usage'
        }
      ],
      require.resolve('@babel/preset-typescript')
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      require.resolve('@babel/plugin-proposal-class-properties')
    ]
  };
}
